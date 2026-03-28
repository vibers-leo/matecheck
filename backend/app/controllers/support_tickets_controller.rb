class SupportTicketsController < ApplicationController
  skip_before_action :authenticate_user!

  # Allow anonymous or check token if available.
  # For simplicity, we assume the frontend sends what it has.

  def create
    @ticket = SupportTicket.new(ticket_params)
    @ticket.completed = false

    if @ticket.save
      # 메일 발송 실패해도 티켓은 정상 생성
      begin
        SupportMailer.new_ticket_email(@ticket).deliver_now
      rescue => e
        Rails.logger.error("메일 발송 실패: #{e.message}")
      end
      render json: { message: 'Ticket created successfully', ticket: @ticket }, status: :created
    else
      render json: { error: @ticket.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def ticket_params
    params.require(:support_ticket).permit(:category, :title, :content, :user_id, :email)
  end
end
