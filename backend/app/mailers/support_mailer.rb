class SupportMailer < ApplicationMailer
  default from: 'notifications@matecheck.com'

  def new_ticket_email(ticket)
    @ticket = ticket
    mail(to: 'juuuno@naver.com', subject: "[MateCheck] New Support Ticket: #{@ticket.title}")
  end
end
