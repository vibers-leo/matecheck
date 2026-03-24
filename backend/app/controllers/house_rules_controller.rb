class HouseRulesController < ApplicationController
  include NestAccessible

  before_action :set_nest
  before_action :verify_nest_access!

  def index
    @house_rules = @nest.house_rules.where(is_active: true).order(priority: :asc)
                        .page(params[:page]).per(params[:per_page] || 20)
    render json: {
      data: @house_rules,
      meta: {
        current_page: @house_rules.current_page,
        total_pages: @house_rules.total_pages,
        total_count: @house_rules.total_count
      }
    }
  end

  def create
    @house_rule = @nest.house_rules.build(house_rule_params)
    @house_rule.is_active = true
    
    if @house_rule.save
      render json: @house_rule, status: :created
    else
      render json: { errors: @house_rule.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @house_rule = @nest.house_rules.find(params[:id])
    if @house_rule.update(house_rule_params)
      render json: @house_rule
    else
      render json: { errors: @house_rule.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @house_rule = @nest.house_rules.find(params[:id])
    @house_rule.destroy
    head :no_content
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def house_rule_params
    params.require(:house_rule).permit(:title, :description, :rule_type, :priority)
  end
end
