class NaverAuthController < ApplicationController
  skip_before_action :authenticate_user!

  # POST /auth/naver
  def create
    access_token = params[:access_token]
    unless access_token.present?
      return render json: { error: '네이버 액세스 토큰이 필요합니다.' }, status: :bad_request
    end

    naver_user = fetch_naver_user(access_token)
    unless naver_user
      return render json: { error: '네이버 인증에 실패했습니다.' }, status: :unauthorized
    end

    user = find_or_create_social_user('naver', naver_user)
    render_auth_response(user)
  end

  private

  def fetch_naver_user(access_token)
    response = HTTParty.get('https://openapi.naver.com/v1/nid/me', {
      headers: { 'Authorization' => "Bearer #{access_token}" }
    })
    return nil unless response.success?

    data = response.parsed_response.dig('response')
    return nil unless data

    { id: data['id'], email: data['email'], name: data['name'] || data['nickname'], image: data['profile_image'] }
  rescue => e
    Rails.logger.error "[NaverAuth] API 호출 실패: #{e.message}"
    nil
  end

  def find_or_create_social_user(provider, social_user)
    user = User.find_by(provider: provider, uid: social_user[:id])
    return user if user

    if social_user[:email].present?
      user = User.find_by(email: social_user[:email])
      if user
        user.update(provider: provider, uid: social_user[:id])
        return user
      end
    end

    User.create(
      email: social_user[:email].presence || "#{provider}_#{social_user[:id]}@placeholder.matecheck.com",
      password: SecureRandom.hex(16),
      nickname: social_user[:name] || '네이버 사용자',
      provider: provider,
      uid: social_user[:id]
    )
  end

  def render_auth_response(user)
    if user.persisted?
      response_data = { message: '로그인 성공', user: { id: user.id, email: user.email, nickname: user.nickname, avatar_id: user.avatar_id, provider: user.provider } }
      if user.nest
        response_data[:nest] = { id: user.nest.id, name: user.nest.name, theme_id: user.nest.theme_id, invite_code: user.nest.invite_code,
          members: user.nest.users.where(nest_status: 'active').map { |u| { id: u.id, nickname: u.nickname, avatar_id: u.avatar_id } } }
      end
      render json: response_data, status: :ok
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
