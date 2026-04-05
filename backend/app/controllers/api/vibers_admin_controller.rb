class Api::VibersAdminController < ApplicationController
  skip_before_action :authenticate_user!, raise: false
  skip_before_action :verify_authenticity_token, raise: false

  before_action :verify_admin_secret

  def index
    stats = {
      totalUsers: User.count,
      contentCount: Nest.count,
      mau: 0,
      recentSignups: User.where("created_at > ?", 7.days.ago).count
    }

    recent_activity = User.order(created_at: :desc).limit(5).map do |u|
      { id: u.id.to_s, type: "signup", label: u.email || u.nickname, timestamp: u.created_at }
    end

    render json: {
      projectId: "matecheck",
      projectName: "메이트체크",
      stats: stats,
      recentActivity: recent_activity,
      health: "healthy"
    }
  end

  def resource
    case params[:resource]
    when "nests"
      data = Nest.order(created_at: :desc).limit(50).map do |n|
        { id: n.id.to_s, name: n.name, memberCount: n.users.count, createdAt: n.created_at }
      end
      render json: data
    when "support_tickets"
      data = SupportTicket.order(created_at: :desc).limit(50).map do |t|
        { id: t.id.to_s, title: t.title, status: t.status, createdAt: t.created_at }
      end
      render json: data
    else
      render json: [], status: :ok
    end
  end

  private

  def verify_admin_secret
    unless request.headers["X-Vibers-Admin-Secret"] == ENV["VIBERS_ADMIN_SECRET"]
      render json: { error: "Unauthorized" }, status: :unauthorized
    end
  end
end
