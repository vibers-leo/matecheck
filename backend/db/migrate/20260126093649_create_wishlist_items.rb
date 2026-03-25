class CreateWishlistItems < ActiveRecord::Migration[8.1]
  def change
    create_table :wishlist_items do |t|
      t.string :title
      t.string :quantity
      t.integer :price
      t.string :status
      t.references :nest, null: false, foreign_key: true
      t.integer :requester_id

      t.timestamps
    end
  end
end
