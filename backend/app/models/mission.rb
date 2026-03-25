class Mission < ApplicationRecord
  belongs_to :nest
  has_many :mission_assignments, dependent: :destroy
  has_many :assignees, through: :mission_assignments, source: :user
end
