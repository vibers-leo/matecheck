class CreateSupportTickets < ActiveRecord::Migration[8.1]
  def change
    create_table :support_tickets do |t|
      t.string :category
      t.string :title
      t.text :content
      t.integer :user_id
      t.string :email
      t.boolean :completed

      t.timestamps
    end
  end
end
