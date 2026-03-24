class SessionsController < ApplicationController
  skip_before_action :authenticate_user!

  def create
    # N+1 방지: nest와 nest.users를 미리 로드
    user = User.includes(nest: :users).find_by(email: params[:email])
    
    if user && user.authenticate(params[:password])
      # Login success
      response_data = { message: "Login successful", user: user }
      
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
end
