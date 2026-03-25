class CreateTransactions < ActiveRecord::Migration[8.1]
  def change
    create_table :transactions do |t|
      t.string :title
      t.decimal :amount
      t.string :category
      t.date :date
      t.integer :payer_id
      t.references :nest, null: false, foreign_key: true

      t.timestamps
    end
  end
end
