class User < ApplicationRecord
  has_secure_password validations: false

  belongs_to :nest, optional: true
  
  validates :email, presence: true, uniqueness: true, if: -> { member_type.nil? || member_type == 'human' }
  validates :password, presence: true, length: { minimum: 6 }, if: -> { (member_type.nil? || member_type == 'human') && !password_digest.present? }
  validates :password, length: { minimum: 6 }, allow_nil: true, if: -> { (member_type.nil? || member_type == 'human') }

  def generate_reset_token!
    self.reset_password_token = SecureRandom.urlsafe_base64(32)
    self.reset_password_sent_at = Time.current
    save!
    reset_password_token
  end

  # password_digest 등 민감 정보 노출 차단
  def as_json(options = {})
    super(options.merge(except: Array(options[:except]) | [:password_digest, :reset_password_token]))
  end

  def reset_token_valid?
    reset_password_sent_at.present? && reset_password_sent_at > 2.hours.ago
  end

  def reset_password_with_token!(new_password)
    self.password = new_password
    self.reset_password_token = nil
    self.reset_password_sent_at = nil
    save!
  end
end
