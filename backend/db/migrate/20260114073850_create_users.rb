class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :email
      t.string :password_digest
      t.string :nickname
      t.integer :avatar_id
      t.integer :nest_id

      t.timestamps
    end
  end
end
