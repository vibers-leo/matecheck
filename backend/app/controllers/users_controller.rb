class UsersController < ApplicationController
  skip_before_action :authenticate_user!, only: [:create]

  def create
    user = User.new(user_params)
    if user.save
      render json: { message: "User created successfully", user: user }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    user = User.find_by(email: params[:email])
    if user && user.update(user_params)
      render json: { message: "Profile updated", user: user }, status: :ok
    else
      render json: { error: "User not found or update failed" }, status: :unprocessable_entity
    end
  end

  def update_password
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:current_password])
      if user.update(password: params[:new_password], password_confirmation: params[:new_password_confirmation])
        render json: { message: "Password updated successfully" }, status: :ok
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: "Current password incorrect" }, status: :unauthorized
    end
  end

  def destroy
    user = User.find_by(email: params[:email])
    if user && user.authenticate(params[:password])
      user.destroy
      render json: { message: "Account deleted" }, status: :ok
    else
      render json: { error: "Authentication failed" }, status: :unauthorized
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation, :nickname, :avatar_id)
  end
end
