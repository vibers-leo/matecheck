class AddTimeToCalendarEvents < ActiveRecord::Migration[8.1]
  def change
    add_column :calendar_events, :time, :string
  end
end
