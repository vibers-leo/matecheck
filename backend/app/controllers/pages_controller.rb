class PagesController < ActionController::Base
  def home
    render layout: "landing"
  end
end
