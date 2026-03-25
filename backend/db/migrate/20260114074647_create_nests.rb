class CreateNests < ActiveRecord::Migration[8.1]
  def change
    create_table :nests do |t|
      t.string :name
      t.integer :theme_id
      t.string :invite_code

      t.timestamps
    end
  end
end
