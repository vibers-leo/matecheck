class SlackNotifierService
  require 'httparty'

  WEBHOOK_URL = ENV['SLACK_WEBHOOK_URL']

  def self.notify(message)
    return unless WEBHOOK_URL.present?

    begin
      HTTParty.post(WEBHOOK_URL, {
        body: { text: message }.to_json,
        headers: { 'Content-Type' => 'application/json' }
      })
    rescue => e
      Rails.logger.error "[SlackNotifier] 알림 전송 실패: #{e.message}"
    end
  end

  def self.notify_crawling_result(results)
    message = <<~MSG
      :clipboard: *메이트체크 정책 크롤링 완료!*

      :bar_chart: *수집 통계:*
      - 신규 정책: #{results[:new_count]}건
      - 중복 건너뜀: #{results[:skipped_count]}건

      :stopwatch: *소요:* #{results[:duration]}초
      #{results[:errors]&.any? ? ":warning: *에러:* #{results[:errors].size}건" : ":white_check_mark: *완료*"}
    MSG

    notify(message)
  end

  def self.notify_failure(job_name, error)
    message = <<~MSG
      :rotating_light: *[메이트체크] #{job_name} 실패*

      :x: *에러:* #{error.class}: #{error.message}
      :round_pushpin: *위치:* #{error.backtrace&.first}
      :stopwatch: *시간:* #{Time.current.strftime('%Y-%m-%d %H:%M:%S')}
    MSG

    notify(message)
  end
end
