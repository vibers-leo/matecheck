class AddProfileFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :region, :string
    add_column :users, :birth_date, :date
    add_column :users, :gender, :string
    add_column :users, :occupation, :string
  end
end
