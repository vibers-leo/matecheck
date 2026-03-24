class NestsController < ApplicationController
  include NestAccessible

  before_action :verify_nest_access!, only: [:show]

  def show
    nest = Nest.includes(:users).find(params[:id])
    render json: nest_data(nest)
  end

  def create
    invite_code = SecureRandom.alphanumeric(6).upcase
    nest_params = params[:nest] || {}
    nest_params = params[:nest] || {}
    nest = Nest.new(name: nest_params[:name], theme_id: nest_params[:theme_id], invite_code: invite_code, image_url: nest_params[:image_url])
    
    if nest.save
      user = User.find_by(email: params[:email]) 
      if user
        user.update(nest: nest, nest_status: 'active', nickname: params.dig(:user, :nickname))
        render json: nest_data(nest), status: :created
      else
        render json: { error: "User not found" }, status: :not_found
      end
    else
      render json: { errors: nest.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def join
    nest = Nest.find_by(invite_code: params[:invite_code])
    if nest
      user = User.find_by(email: params[:email])
      if user
        user.update(nest: nest, nest_status: 'pending')
        render json: { message: "Join request sent", status: "pending" }, status: :ok
      else
         render json: { error: "User not found" }, status: :not_found
      end
    else
      render json: { error: "Invalid invite code" }, status: :not_found
    end
  end

  def requests
    nest = Nest.find(params[:id])
    pending_users = nest.users.where(nest_status: 'pending')
    render json: pending_users.map { |u| { id: u.id, nickname: u.nickname, avatar_id: u.avatar_id, email: u.email } }
  end

  def approve
    nest = Nest.find(params[:id])
    user = nest.users.find(params[:user_id])
    if user.update(nest_status: 'active')
      render json: { message: "User approved", members: nest_data(nest)[:members] }
    else
      render json: { error: "Failed to approve user" }, status: :unprocessable_entity
    end
  end

  def add_managed_member
    nest = Nest.find(params[:id])
    member = nest.users.new(
      nickname: params[:nickname],
      avatar_id: params[:avatar_id],
      member_type: params[:member_type], # 'baby', 'pet', 'plant', 'ai'
      nest_status: 'active'
    )
    
    if member.save
      render json: { message: "Member added", members: nest_data(nest)[:members] }, status: :created
    else
      render json: { errors: member.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    nest = Nest.find(params[:id])
    nest_params = params[:nest] || {}
    if nest.update(nest_params.permit(:name, :theme_id, :image_url))
      render json: nest_data(nest)
    else
      render json: { errors: nest.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def nest_data(nest)
    # N+1 방지: users가 이미 로드되어 있지 않으면 preload
    active_users = nest.users.loaded? ? nest.users.select { |u| u.nest_status == 'active' } : nest.users.where(nest_status: 'active')
    {
      id: nest.id,
      name: nest.name,
      theme_id: nest.theme_id,
      image_url: nest.image_url,
      invite_code: nest.invite_code,
      members: active_users.map { |u| { id: u.id, nickname: u.nickname, avatar_id: u.avatar_id, member_type: u.member_type } }
    }
  end
end
