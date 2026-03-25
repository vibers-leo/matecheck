class AddNestStatusToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :nest_status, :string, default: 'active'
  end
end
