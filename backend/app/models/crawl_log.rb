class CrawlLog < ApplicationRecord
  # 검증
  validates :job_name, presence: true
  validates :started_at, presence: true
  validates :status, presence: true, inclusion: { in: %w[running completed failed] }

  # 스코프
  scope :recent, -> { order(started_at: :desc) }
  scope :completed, -> { where(status: 'completed') }
  scope :failed, -> { where(status: 'failed') }
  scope :running, -> { where(status: 'running') }
  scope :by_job, ->(job_name) { where(job_name: job_name) }

  # 헬퍼 메서드
  def self.record_execution(job_name)
    log = create(
      job_name: job_name,
      started_at: Time.current,
      status: 'running'
    )

    begin
      result = yield(log)

      log.update(
        status: 'completed',
        completed_at: Time.current,
        duration_seconds: (Time.current - log.started_at).round(2),
        results: result,
        event_count: calculate_event_count(result),
        error_count: result[:errors]&.size || 0,
        error_details: result[:errors]&.join("\n")
      )

      result
    rescue => e
      log.update(
        status: 'failed',
        completed_at: Time.current,
        duration_seconds: (Time.current - log.started_at).round(2),
        error_count: 1,
        error_details: "#{e.class}: #{e.message}\n#{e.backtrace.first(5).join("\n")}"
      )

      SlackNotifierService.notify_failure(job_name, e)

      raise e
    end
  end

  def self.calculate_event_count(result)
    return 0 unless result.is_a?(Hash)

    result.except(:errors, :duration).values.select { |v| v.is_a?(Numeric) }.sum
  end

  def duration_in_minutes
    return nil unless duration_seconds
    (duration_seconds / 60).round(2)
  end

  def success?
    status == 'completed' && (error_count.nil? || error_count.zero?)
  end
end
