class SplitBillsController < ApplicationController
  include NestAccessible

  before_action :set_nest
  before_action :verify_nest_access!

  def index
    @split_bills = @nest.split_bills.order(due_date: :desc)
                        .page(params[:page]).per(params[:per_page] || 20)
    # N+1 방지: member_count를 한 번만 조회
    member_count = @nest.members.count
    render json: {
      data: @split_bills.map { |bill|
        bill.as_json.merge(
          per_person: member_count > 0 ? bill.total_amount / member_count : 0,
          member_count: member_count
        )
      },
      meta: {
        current_page: @split_bills.current_page,
        total_pages: @split_bills.total_pages,
        total_count: @split_bills.total_count
      }
    }
  end

  def create
    @split_bill = @nest.split_bills.build(split_bill_params)
    @split_bill.is_paid = false
    @split_bill.split_method ||= 'equal'

    if @split_bill.save
      member_count = @nest.members.count
      render json: @split_bill.as_json.merge(
        per_person: member_count > 0 ? @split_bill.total_amount / member_count : 0,
        member_count: member_count
      ), status: :created
    else
      render json: { errors: @split_bill.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @split_bill = @nest.split_bills.find(params[:id])
    if @split_bill.update(split_bill_params)
      render json: @split_bill
    else
      render json: { errors: @split_bill.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @split_bill = @nest.split_bills.find(params[:id])
    @split_bill.destroy
    head :no_content
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def split_bill_params
    params.require(:split_bill).permit(:title, :total_amount, :bill_type, :due_date, :is_paid, :split_method)
  end
end
