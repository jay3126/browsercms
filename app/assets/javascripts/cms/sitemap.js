//= require 'jquery'
//= require 'jquery.ui.all'
//= require 'jquery.cookie'
//= require 'bootstrap'
//= require 'cms/ajax'
//= require 'underscore'

// Sitemap uses JQuery.Draggable/Droppable to handling moving elements, with custom code below.
// Open/Close are handled as code below.
var Sitemap = function() {
};

// Name of cookie that stores SectionNode ids that should be opened.
Sitemap.STATE = 'cms.sitemap.open_folders';

// Different Content types have different behaviors when double clicked.
Sitemap.prototype._doubleClick = function(event) {
  var type = $(event.target).data('type');
  switch(type) {
    case 'section':
    case 'link':
      $('#properties-button')[0].click();
      break;
    default:
      $('#edit-button')[0].click();
  }
};

// @param [Number] node_id
// @param [Number] target_node_id
// @param [Number] position A 1 based position for order
Sitemap.prototype.moveTo = function(node_id, target_node_id, position) {
  var path = "/cms/section_nodes/" + node_id + '/move_to_position'
  $.cms_ajax.put({
    url: path,
    data: {
      target_node_id: target_node_id,
      position: position
    },
    success: function(result) {
      sitemap.clickWebsite();
    }
  });
};

// @param [Selector] Determines if a section is open.
Sitemap.prototype.isOpen = function(row) {
  return row.find('.type-icon').hasClass('icon-folder-open');
};

// @param [Selector] link A selected link (<a>)
// @param [String] icon The full name of the icon (icon-folder-open)
Sitemap.prototype.changeIcon = function(row, icon) {
  row.find('.type-icon').attr('class', 'type-icon').addClass(icon);
};

// @param [Number] id
Sitemap.prototype.saveAsOpened = function(id) {
  $.cookieSet.add(Sitemap.STATE, id);
};

// @param [Number] id
Sitemap.prototype.saveAsClosed = function(id) {
  $.cookieSet.remove(Sitemap.STATE, id);
};

// Reopen all sections that the user was last working with.
Sitemap.prototype.restoreOpenState = function() {
  var section_node_ids = $.cookieSet.get(Sitemap.STATE);
  _.each(section_node_ids, function(id) {
    var row = $('.nav-list-span[data-id=' + id + ']');
    sitemap.open(row, {animate: false});
  });
};

// Determines if the selected row is a Folder or not.
Sitemap.prototype.isFolder = function(row) {
  return row.data('type') == 'folder';
};

Sitemap.prototype.isClosable = function(row) {
  return row.data('closable') == true;
};

// @param [Selector] link
// @param [Object] options
Sitemap.prototype.open = function(row, options) {
  options = options || {}
  _.defaults(options, {animate: true});
  this.changeIcon(row, 'icon-folder-open');
  var siblings = row.siblings('ul.nav');
  if (options.animate) {
    siblings.slideToggle();
  }
  else {
    siblings.show();
  }
  this.saveAsOpened(row.data('id'));
};

// Attempts to open the given row. Will skip if the item cannot or is already open.
Sitemap.prototype.attemptOpen = function(row, options) {
  if (!this.isOpen(row)) {
    this.open(row, options);
  }
};

Sitemap.prototype.close = function(row) {
  this.changeIcon(row, 'icon-folder');
  row.siblings('ul.nav').slideToggle();
  this.saveAsClosed(row.data('id'));
};

Sitemap.prototype.toggleOpen = function(row) {
  if (!this.isClosable(row)) {
    return;
  }
  if (this.isOpen(row)) {
    this.close(row);
  } else {
    this.open(row);
  }
};

Sitemap.prototype.updateDepth = function(element, newDepth) {
  var depthClass = "level-" + newDepth;
  element.attr('class', 'ui-draggable ui-droppable nav-list-span').addClass(depthClass);
  element.attr('data-depth', newDepth);
};

var sitemap = new Sitemap();

// Enable dragging of items around the sitemap.
$(function() {
  $('#sitemap .nav-list-span').draggable({
    containment: '#sitemap',
    revert: true,
    revertDuration: 0,
    axis: 'y',
    delay: 250,
    cursor: 'move',
    stack: '.nav-list-span'
  });

  $('#sitemap .nav-list-span').droppable({
    hoverClass: "droppable",
    drop: function(event, ui) {
      var movedElement = ui.draggable.parents('.nav-list').first();
      var droppedOnElement = $(this).parents('.nav-list').first();
      var targetDepth = $(this).data('depth');

      if (sitemap.isFolder($(this))) {
        // Drop INTO sections
        sitemap.attemptOpen($(this));
        sitemap.updateDepth(ui.draggable, targetDepth + 1);
        droppedOnElement.find('li').first().append(movedElement);

      } else {
        sitemap.updateDepth(ui.draggable, targetDepth);
        // Drop AFTER pages
        movedElement.insertAfter(droppedOnElement);
      }


      // Need a manual delay otherwise the animation happens before the insert.
      window.setTimeout(function() {
        ui.draggable.effect({effect: 'highlight', duration: 500, color: '#0079c1'});
      }, 250);
    }
  });
});

// Open/close folders when rows are clicked.
$(function() {
  // Ensure this only loads on sitemap page.
  if ($('#sitemap').exists()) {
    sitemap.restoreOpenState();
    $('.nav-list-span').on('click', function(event) {
      sitemap.toggleOpen($(this));
    });
  }

});

// Make Sitemap filters show specific content types.
$(function() {
  $('#sitemap li[data-nodetype]').hide();
  $('#filtershow').change(function() {
    $('#sitemap li[data-nodetype]').slideUp();
    var what = $(this).val();
    if (what == "none") {
      $('#sitemap li[data-nodetype]').slideUp();
    } else if (what == "all") {
      $('#sitemap li[data-nodetype]').slideDown();
      $('#sitemap li[data-nodetype]').parents('li').children('a[data-toggle]').click();
    } else {
      $('#sitemap li[data-nodetype="' + what + '"]').slideDown();
      $('#sitemap li[data-nodetype="' + what + '"]').parents('li').children('a[data-toggle]').click();
    }
  });
});