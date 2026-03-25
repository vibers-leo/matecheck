class AddImageUrlToNests < ActiveRecord::Migration[8.1]
  def change
    add_column :nests, :image_url, :string
  end
end
