class CreateChoreRotations < ActiveRecord::Migration[8.1]
  def change
    create_table :chore_rotations do |t|
      t.references :nest, null: false, foreign_key: true
      t.string :chore_name
      t.string :rotation_type
      t.integer :current_assignee_id
      t.date :next_rotation_date

      t.timestamps
    end
  end
end
