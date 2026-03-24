class AddCriticalIndexes < ActiveRecord::Migration[8.1]
  def change
    add_index :users, :email, unique: true
    add_index :users, :nest_id
    add_index :life_infos, :category
    add_index :life_infos, :region
    add_index :life_infos, [:min_age, :max_age]
    add_index :life_infos, :occupation
    add_index :transactions, :payer_id
    add_index :calendar_events, :creator_id
    add_index :chore_rotations, :current_assignee_id
    add_index :wishlist_items, :requester_id
  end
end
