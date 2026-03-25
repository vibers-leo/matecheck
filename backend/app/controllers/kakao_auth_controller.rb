class KakaoAuthController < ApplicationController
  skip_before_action :authenticate_user!

  # POST /auth/kakao
  # params: { access_token: "카카오에서 받은 토큰" }
  def create
    access_token = params[:access_token]

    unless access_token.present?
      return render json: { error: '카카오 액세스 토큰이 필요합니다.' }, status: :bad_request
    end

    # 카카오 API로 사용자 정보 조회
    kakao_user = fetch_kakao_user(access_token)

    unless kakao_user
      return render json: { error: '카카오 인증에 실패했습니다.' }, status: :unauthorized
    end

    # 사용자 찾기 또는 생성
    user = find_or_create_kakao_user(kakao_user)

    if user.persisted?
      response_data = {
        message: '카카오 로그인 성공',
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          avatar_id: user.avatar_id,
          provider: user.provider
        }
      }

      # Nest 정보 포함
      if user.nest
        response_data[:nest] = {
          id: user.nest.id,
          name: user.nest.name,
          theme_id: user.nest.theme_id,
          invite_code: user.nest.invite_code,
          members: user.nest.users.where(nest_status: 'active').map { |u|
            { id: u.id, nickname: u.nickname, avatar_id: u.avatar_id }
          }
        }
      end

      render json: response_data, status: :ok
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def fetch_kakao_user(access_token)
    response = HTTParty.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization' => "Bearer #{access_token}",
        'Content-Type' => 'application/x-www-form-urlencoded;charset=utf-8'
      }
    })

    return nil unless response.success?

    data = response.parsed_response
    {
      id: data['id'].to_s,
      nickname: data.dig('properties', 'nickname'),
      profile_image: data.dig('properties', 'profile_image'),
      email: data.dig('kakao_account', 'email')
    }
  rescue => e
    Rails.logger.error "[KakaoAuth] 카카오 API 호출 실패: #{e.message}"
    nil
  end

  def find_or_create_kakao_user(kakao_user)
    # 기존 카카오 사용자 찾기
    user = User.find_by(provider: 'kakao', uid: kakao_user[:id])
    return user if user

    # 이메일로 기존 사용자 찾기 (이메일 제공 시)
    if kakao_user[:email].present?
      user = User.find_by(email: kakao_user[:email])
      if user
        user.update(provider: 'kakao', uid: kakao_user[:id])
        return user
      end
    end

    # 새 사용자 생성
    email = kakao_user[:email].presence || "kakao_#{kakao_user[:id]}@placeholder.matecheck.com"
    User.create(
      email: email,
      password: SecureRandom.hex(16),
      nickname: kakao_user[:nickname] || '카카오 사용자',
      provider: 'kakao',
      uid: kakao_user[:id]
    )
  end
end
