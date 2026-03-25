class CreateMissions < ActiveRecord::Migration[8.1]
  def change
    create_table :missions do |t|
      t.string :title
      t.boolean :is_completed
      t.integer :assigned_to
      t.references :nest, null: false, foreign_key: true
      t.string :repeat
      t.string :image_url

      t.timestamps
    end
  end
end
