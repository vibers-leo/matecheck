class CreateCrawlLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :crawl_logs do |t|
      t.string :job_name, null: false
      t.string :status, null: false, default: 'running'
      t.datetime :started_at, null: false
      t.datetime :completed_at
      t.float :duration_seconds
      t.integer :event_count, default: 0
      t.integer :error_count, default: 0
      t.text :error_details
      t.json :results

      t.timestamps
    end

    add_index :crawl_logs, :job_name
    add_index :crawl_logs, :status
    add_index :crawl_logs, :started_at
  end
end
