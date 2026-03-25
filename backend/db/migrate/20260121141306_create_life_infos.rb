class CreateLifeInfos < ActiveRecord::Migration[8.1]
  def change
    create_table :life_infos do |t|
      t.string :title
      t.text :content
      t.string :category
      t.string :source_url
      t.string :image_url
      t.datetime :published_at
      t.string :target_audience

      t.timestamps
    end
  end
end
