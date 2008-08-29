require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe Connector do
  it_should_validate_presence_of :container  
  it "should be able to find by block" do
    foo = create_html_block(:name => "foo")
    bar = create_html_block(:name => "bar")
    create_connector(:content_block => foo)
    blocks = Connector.for_block(foo).map(&:content_block)
    blocks.should include(foo)
    blocks.should_not include(bar)
  end




 # Question: Why does c.delete throw a 'NoSuchMethod' error?
 # Isn't 'c' an ActiveRecord object or is there some weird scoping rules I'm not aware of?


=begin
it "should not delete blocks when deleting a connector" do
    b = create_html_block
    c = create_connector(:content_block => b)
    c.delete                            # Exception thrown here

    f = HtmlBlock.find(b)
    f.should_not be_nil
  end
=end






end
