module Cms
  module SectionNodesHelper

    # Generate HTML for draft icon for pages that are in draft
    # @param [Object] content
    # @return [String] HTML (HTML safe)
    def draft_icon_tag(content)
      if content.respond_to?(:draft?) && content.draft?
        '<span class="draft">Draft</span>'.html_safe
      else
        ''
      end
    end


    def add_page_path_data(section_node, parent_section_node)
      section = figure_out_target_section(parent_section_node, section_node)
      new_section_page_path(section)
    end

    def add_link_path_data(section_node, parent_section_node)
      section = figure_out_target_section(parent_section_node, section_node)
      new_section_link_path(section)
    end

    def add_section_path_data(section_node, parent_section_node)
      section = figure_out_target_section(parent_section_node, section_node)
      new_section_path(section_id: section)
    end

    def figure_out_target_section(parent_section_node, section_node)
      section = if section_node.section?
                  section_node.node
                else
                  parent_section_node.node
                end
    end

    # When sitemap initially renders, we only want to show first level.
    def initial_visibility_class(section_node)
      section_node.depth > 1 ? 'hide' : ''
    end

    # Returns a css class for determine sitemap depth.
    def sitemap_depth_class(section_node)
      one_based_depth = section_node.depth + 1
      "level-#{one_based_depth}"
    end

    # Generate HTML for 'hidden' icon for hidden content.
    # @param [Object] content
    # @return [String] HTML (HTML safe)
    def hidden_icon_tag(content)
      if content.respond_to?(:hidden?) && content.hidden?
        '<span aria-hidden="true" class="permission-icon icon-eye-blocked"></span>'.html_safe
      else
        ''
      end
    end

    def guest_accessible_icon_tag(parent, content)
      unless content.accessible_to_guests?(@public_sections, parent)
        '<span aria-hidden="true" class="permission-icon icon-locked"></span>'.html_safe
      else
        ''
      end
    end

    # Generate the HTML for a given section node.
    def icon_tag(section_node, children)
      name = if section_node.ancestors.size == 0
               'earth'
             elsif section_node.home?
               'house'
             elsif section_node.link?
               'link'
             elsif section_node.page?
               'file'
             elsif children.empty?
               'folder-open'
             else
               'folder'
             end
      content_tag("span", "", {'aria-hidden' => true, class: "type-icon icon-#{name}"})
    end

    # Marks a section to determine if it can be opened/closed in the sitemap.
    def closable_data(section_node, children)
      if (section_node.root?)
        false
      elsif !children.empty?
        true
      else
        false
      end
    end

    def current_user_can_modify(modifiable_sections, section_node, parent_section_node)
      if section_node.section?
        modifiable_sections.include?(section_node.node)
      else
        modifiable_sections.include?(parent_section_node.node)
      end
    end

    # Determines if a row is leaf or folder based on whether there are any subchildren.
    def row_type_tag(section_node)
      section_node.section? ? 'folder' : 'leaf'
    end

    ## Pre 4.0 Redesign helpers

    # @deprecated
    def protected_content_icon(section)
      icon "warning-sign" unless @modifiable_sections.include?(section)
    end

    # @deprecated
    def icon(name)
      content_tag("i", "", {class: "icon-#{name}"})
    end

    def status_tag(publishable_content)
      status = publishable_content.status.to_s
      letter = status[0, 1]
      content_tag("span", letter, class: "status #{status}")
    end

    def access_status(section_node, public_sections)
      access_icon = 'ok-circle'
      unless public_sections.include?(section_node)
        access_icon = 'lock'
      end
      "icon-#{access_icon}"
    end

    def section_icons(section_node, children=[])
      folder_style = ""
      expander_image = "expand.png"
      if top_level_section?(section_node)
        folder_style = " large"
        expander_image = "gray_expand.png"
      end
      if children.empty?
        image_tag("cms/sitemap/no_contents.png", :class => "no_folder_toggle#{folder_style}")
      else
        image_tag("cms/sitemap/#{expander_image}", :class => "folder_toggle#{folder_style}", :data => {:toggle => "collapse", :target => "#subsection#{section_node.id}"})
      end
    end

    # Renders the ul for a given node (Page/Section/Link/etc)
    # Default look:
    #   - First level pages/sections use 'big' icons
    #   - All non-first level items should be hidden.
    def sitemap_ul_tag(node)
      opts = {
          :id => "section_node_#{node.section_node.id}",
          :class => "section_node"
      }
      opts[:class] += " rootlet" if in_first_level?(node)
      #opts[:style] = "display: none" unless in_first_level?(node)
      tag("ul", opts, true)
    end

    def in_first_level?(node)
      node.section_node.depth == 1
    end

    private

    def top_level_section?(node)
      node.depth <= 2
    end

  end
end
