class CreateHouseRules < ActiveRecord::Migration[8.1]
  def change
    create_table :house_rules do |t|
      t.references :nest, null: false, foreign_key: true
      t.string :title
      t.text :description
      t.string :rule_type
      t.boolean :is_active
      t.integer :priority

      t.timestamps
    end
  end
end
