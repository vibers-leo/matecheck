class ApplicationController < ActionController::API
  before_action :authenticate_user!

  rescue_from ActiveRecord::RecordNotFound do |e|
    render json: { error: "요청한 리소스를 찾을 수 없습니다." }, status: :not_found
  end

  rescue_from ActionController::ParameterMissing do |e|
    render json: { error: "필수 파라미터가 누락되었습니다: #{e.param}" }, status: :bad_request
  end

  private

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last

    if token.blank?
      render json: { error: "인증이 필요합니다." }, status: :unauthorized
      return
    end

    begin
      decoded = ::JWT.decode(token, jwt_secret_key).first
      @current_user = User.find(decoded["user_id"])
    rescue => e
      render json: { error: "인증 실패: #{e.class}" }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end

  def jwt_secret_key
    ENV.fetch("JWT_SECRET_KEY") { Rails.application.secret_key_base }
  end
end
