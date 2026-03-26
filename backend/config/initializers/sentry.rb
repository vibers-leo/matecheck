# Sentry 에러 추적 (SENTRY_DSN 환경변수 + sentry gem 설치 시 활성화)
# 활성화하려면: Gemfile에서 sentry 주석 해제 후 bundle install
if defined?(Sentry) && ENV["SENTRY_DSN"].present?
  Sentry.init do |config|
    config.dsn = ENV["SENTRY_DSN"]
    config.breadcrumbs_logger = [:active_support_logger, :http_logger]
    config.environment = Rails.env
    config.enabled_environments = %w[production staging]
    config.traces_sample_rate = ENV.fetch("SENTRY_TRACES_SAMPLE_RATE", 0.1).to_f
    config.trace_propagation_targets = [/matecheck\.vibers\.co\.kr/]
    config.excluded_exceptions += [
      "ActionController::RoutingError",
      "ActiveRecord::RecordNotFound",
      "ActionController::InvalidAuthenticityToken"
    ]
    config.send_default_pii = false
    config.release = ENV.fetch("GIT_COMMIT_SHA", "development")
  end
end
