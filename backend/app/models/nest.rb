class Nest < ApplicationRecord
  has_many :users
  has_many :missions, dependent: :destroy
  has_many :calendar_events, dependent: :destroy
  has_many :goals, dependent: :destroy
  has_many :transactions, dependent: :destroy
  has_many :split_bills, dependent: :destroy
  has_many :chore_rotations, dependent: :destroy
  has_many :wishlist_items, dependent: :destroy
  has_many :house_rules, dependent: :destroy
  has_many :anniversaries, dependent: :destroy
  
  validates :invite_code, uniqueness: true, allow_nil: true
end
