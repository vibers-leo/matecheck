class AddDatesToLifeInfos < ActiveRecord::Migration[8.1]
  def change
    add_column :life_infos, :application_start, :datetime
    add_column :life_infos, :application_end, :datetime
    add_column :life_infos, :official_date, :datetime
  end
end
