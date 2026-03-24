module NestAccessible
  extend ActiveSupport::Concern

  private

  def verify_nest_access!
    nest = Nest.find(params[:nest_id] || params[:id])
    unless @current_user&.nest_id == nest.id
      render json: { error: "이 보금자리에 접근 권한이 없습니다." }, status: :forbidden
    end
  end
end
