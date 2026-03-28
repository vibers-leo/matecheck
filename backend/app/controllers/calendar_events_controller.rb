class CalendarEventsController < ApplicationController
  include NestAccessible

  before_action :set_nest
  before_action :verify_nest_access!

  def index
    @calendar_events = @nest.calendar_events.order(date: :asc)
                            .page(params[:page]).per(params[:per_page] || 20)
    render json: {
      data: @calendar_events,
      meta: {
        current_page: @calendar_events.current_page,
        total_pages: @calendar_events.total_pages,
        total_count: @calendar_events.total_count
      }
    }
  end

  def show
    event = @nest.calendar_events.find(params[:id])
    render json: event
  end

  def create
    event = @nest.calendar_events.build(event_params)
    if event.save
      render json: event, status: :created
    else
      render json: { errors: event.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    event = @nest.calendar_events.find(params[:id])
    if event.update(event_params)
      render json: event
    else
      render json: { errors: event.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    event = @nest.calendar_events.find(params[:id])
    event.destroy
    head :no_content
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def event_params
    params.require(:calendar_event).permit(:title, :date, :end_date, :creator_id, :image_url, :event_type, :time)
  end
end
