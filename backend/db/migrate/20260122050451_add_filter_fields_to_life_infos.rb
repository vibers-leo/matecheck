class AddFilterFieldsToLifeInfos < ActiveRecord::Migration[8.1]
  def change
    add_column :life_infos, :region, :string
    add_column :life_infos, :min_age, :integer
    add_column :life_infos, :max_age, :integer
    add_column :life_infos, :gender, :string
    add_column :life_infos, :occupation, :string
    add_column :life_infos, :priority, :integer
  end
end
