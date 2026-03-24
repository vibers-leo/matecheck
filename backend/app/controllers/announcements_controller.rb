class AnnouncementsController < ApplicationController
  skip_before_action :authenticate_user!

  def index
    @announcements = Announcement.where('published_at <= ?', Time.current)
                                  .order(published_at: :desc)
                                  .page(params[:page]).per(params[:per_page] || 20)
    render json: {
      data: @announcements,
      meta: {
        current_page: @announcements.current_page,
        total_pages: @announcements.total_pages,
        total_count: @announcements.total_count
      }
    }
  end

  def show
    @announcement = Announcement.find(params[:id])
    render json: @announcement
  end
end
