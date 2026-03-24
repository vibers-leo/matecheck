class GoalsController < ApplicationController
  include NestAccessible

  before_action :set_nest
  before_action :verify_nest_access!

  def index
    render json: @nest.goals
  end

  def create
    goal = @nest.goals.build(goal_params)
    if goal.save
      render json: goal, status: :created
    else
      render json: { errors: goal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    goal = @nest.goals.find(params[:id])
    if goal.update(goal_params)
      render json: goal
    else
      render json: { errors: goal.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    goal = @nest.goals.find(params[:id])
    goal.destroy
    head :no_content
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def goal_params
    params.require(:goal).permit(:goal_type, :title, :current, :target, :unit)
  end
end
