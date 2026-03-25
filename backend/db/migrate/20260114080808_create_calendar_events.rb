class CreateCalendarEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :calendar_events do |t|
      t.string :title
      t.date :date
      t.date :end_date
      t.integer :creator_id
      t.references :nest, null: false, foreign_key: true
      t.string :image_url
      t.string :event_type

      t.timestamps
    end
  end
end
