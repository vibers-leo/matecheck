class PasswordResetsController < ApplicationController
  skip_before_action :authenticate_user!

  # POST /password/forgot
  # 비밀번호 찾기 요청 (이메일로 리셋 토큰 발송)
  def create
    user = User.find_by(email: params[:email])

    if user
      token = user.generate_reset_token!

      # 이메일 발송 (메일러가 설정되면 실제 발송, 아니면 로그에 토큰 출력)
      begin
        PasswordResetMailer.reset_email(user, token).deliver_later
      rescue => e
        Rails.logger.info "[PasswordReset] 토큰: #{token} (이메일: #{user.email})"
      end
    end

    # 보안: 이메일 존재 여부와 관계없이 같은 응답
    render json: {
      message: '비밀번호 재설정 링크가 이메일로 발송되었습니다. 이메일을 확인해주세요.'
    }, status: :ok
  end

  # POST /password/reset
  # 새 비밀번호 설정 (토큰 + 새 비밀번호)
  def update
    user = User.find_by(reset_password_token: params[:token])

    unless user
      return render json: { error: '유효하지 않은 토큰입니다.' }, status: :unprocessable_entity
    end

    unless user.reset_token_valid?
      return render json: { error: '토큰이 만료되었습니다. 다시 요청해주세요.' }, status: :unprocessable_entity
    end

    if params[:password].blank? || params[:password].length < 6
      return render json: { error: '비밀번호는 6자 이상이어야 합니다.' }, status: :unprocessable_entity
    end

    if user.reset_password_with_token!(params[:password])
      render json: { message: '비밀번호가 성공적으로 변경되었습니다.' }, status: :ok
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
