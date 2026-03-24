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
    email = request.headers["Authorization"] || params[:email]

    if email.blank?
      render json: { error: "인증이 필요합니다." }, status: :unauthorized
      return
    end

    @current_user = User.find_by(email: email)

    unless @current_user
      render json: { error: "유효하지 않은 사용자입니다." }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end
end
