class CreateAnniversaries < ActiveRecord::Migration[8.1]
  def change
    create_table :anniversaries do |t|
      t.references :nest, null: false, foreign_key: true
      t.string :title
      t.date :anniversary_date
      t.boolean :is_recurring
      t.string :category

      t.timestamps
    end
  end
end
