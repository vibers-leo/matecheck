class CreateSplitBills < ActiveRecord::Migration[8.1]
  def change
    create_table :split_bills do |t|
      t.references :nest, null: false, foreign_key: true
      t.string :title
      t.decimal :total_amount
      t.string :bill_type
      t.date :due_date
      t.boolean :is_paid
      t.string :split_method

      t.timestamps
    end
  end
end
