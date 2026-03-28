class ApplicationController < ActionController::API
  before_action :authenticate_user!

  rescue_from ActiveRecord::RecordNotFound do |e|
    render json: { error: "요청한 리소스를 찾을 수 없습니다." }, status: :not_found
  end

  rescue_from ActionController::ParameterMissing do |e|
    render json: { error: "필수 파라미터가 누락되었습니다: #{e.param}" }, status: :bad_request
  end

  rescue_from StandardError do |e|
    if Rails.env.production?
      render json: { error: "서버 오류가 발생했습니다." }, status: :internal_server_error
    else
      render json: { error: e.message, backtrace: e.backtrace&.first(5) }, status: :internal_server_error
    end
  end

  private

  def authenticate_user!
    token = request.headers["Authorization"]&.split(" ")&.last

    if token.blank?
      render json: { error: "인증이 필요합니다." }, status: :unauthorized
      return
    end

    begin
      # JWT 토큰 디코딩
      decoded = JWT.decode(token, jwt_secret_key).first
      @current_user = User.find(decoded["user_id"])
    rescue JWT::ExpiredSignature
      render json: { error: "토큰이 만료되었습니다." }, status: :unauthorized
    rescue JWT::DecodeError
      render json: { error: "유효하지 않은 토큰입니다." }, status: :unauthorized
    rescue ActiveRecord::RecordNotFound
      render json: { error: "유효하지 않은 사용자입니다." }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end

  def jwt_secret_key
    ENV.fetch("JWT_SECRET_KEY") { Rails.application.secret_key_base }
  end
end
