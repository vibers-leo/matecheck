class AddMemberTypeToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :member_type, :string
  end
end
