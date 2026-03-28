class TransactionsController < ApplicationController
  include NestAccessible

  before_action :set_nest
  before_action :verify_nest_access!

  def index
    @transactions = @nest.transactions.order(date: :desc)
                         .page(params[:page]).per(params[:per_page] || 20)
    render json: {
      data: @transactions,
      meta: {
        current_page: @transactions.current_page,
        total_pages: @transactions.total_pages,
        total_count: @transactions.total_count
      }
    }
  end

  def show
    transaction = @nest.transactions.find(params[:id])
    render json: transaction
  end

  def create
    transaction = @nest.transactions.build(transaction_params)
    if transaction.save
      render json: transaction, status: :created
    else
      render json: { errors: transaction.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    transaction = @nest.transactions.find(params[:id])
    if transaction.update(transaction_params)
      render json: transaction
    else
      render json: { errors: transaction.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    transaction = @nest.transactions.find(params[:id])
    transaction.destroy
    head :no_content
  end

  private

  def set_nest
    @nest = Nest.find(params[:nest_id])
  end

  def transaction_params
    params.require(:transaction).permit(:title, :amount, :category, :date, :payer_id)
  end
end
