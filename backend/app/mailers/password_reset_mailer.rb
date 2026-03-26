class PasswordResetMailer < ApplicationMailer
  default from: 'noreply@matecheck.com'

  def reset_email(user, token)
    @user = user
    @token = token
    @reset_url = "matecheck://password-reset?token=#{token}"

    mail(
      to: user.email,
      subject: '[MateCheck] 비밀번호 재설정'
    )
  end
end
