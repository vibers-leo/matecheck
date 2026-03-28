class SessionsController < ApplicationController
  skip_before_action :authenticate_user!, only: [:create, :refresh]

  def create
    # N+1 방지: nest와 nest.users를 미리 로드
    user = User.includes(nest: :users).find_by(email: params[:email])
    
    if user && user.authenticate(params[:password])
      # JWT 토큰 생성
      token = JWT.encode(
        { user_id: user.id, exp: 24.hours.from_now.to_i },
        jwt_secret_key
      )

      response_data = { message: "로그인 성공", token: token, user: user }

      if user.nest
        response_data[:nest] = {
          id: user.nest.id,
          name: user.nest.name,
          theme_id: user.nest.theme_id,
          invite_code: user.nest.invite_code,
          members: user.nest.users.map { |u| { id: u.id, nickname: u.nickname, avatar_id: u.avatar_id } }
        }
      end

      render json: response_data, status: :ok
    else
      render json: { error: "이메일 또는 비밀번호가 올바르지 않습니다." }, status: :unauthorized
    end
  end

  # JWT 토큰 갱신
  def refresh
    token = request.headers['Authorization']&.split(' ')&.last
    decoded = JWT.decode(token, jwt_secret_key).first
    user = User.find(decoded['user_id'])
    new_token = JWT.encode(
      { user_id: user.id, exp: 24.hours.from_now.to_i },
      jwt_secret_key
    )
    render json: { token: new_token }
  rescue JWT::DecodeError, ActiveRecord::RecordNotFound
    render json: { error: '토큰 갱신 실패' }, status: :unauthorized
  end
end
