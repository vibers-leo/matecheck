class CreateGoals < ActiveRecord::Migration[8.1]
  def change
    create_table :goals do |t|
      t.string :goal_type
      t.string :title
      t.integer :current
      t.integer :target
      t.string :unit
      t.references :nest, null: false, foreign_key: true

      t.timestamps
    end
  end
end
