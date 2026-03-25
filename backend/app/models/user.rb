class User < ApplicationRecord
  has_secure_password validations: false

  belongs_to :nest, optional: true
  
  validates :email, presence: true, uniqueness: true, if: -> { member_type.nil? || member_type == 'human' }
  validates :password, presence: true, length: { minimum: 6 }, if: -> { (member_type.nil? || member_type == 'human') && !password_digest.present? }
  validates :password, length: { minimum: 6 }, allow_nil: true, if: -> { (member_type.nil? || member_type == 'human') }
end
