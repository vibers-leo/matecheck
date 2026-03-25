# 간단한 레이트 리미터 (rack-attack 대신 Rails 캐시 기반)
# gem 추가 없이 동작 — API 전용

class RateLimiter
  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env)
    ip = request.ip
    path = request.path

    # 인증: 5회/20초
    if path.match?(/\/(login|signup)/) && request.post?
      return too_many_requests if rate_exceeded?("auth:#{ip}", 5, 20.seconds)
    end

    # 일반 API: 100회/분
    return too_many_requests if rate_exceeded?("api:#{ip}", 100, 1.minute)

    @app.call(env)
  end

  private

  def rate_exceeded?(key, limit, period)
    count = Rails.cache.increment(key, 1, expires_in: period) || 1
    count > limit
  end

  def too_many_requests
    [429, { 'Content-Type' => 'application/json; charset=utf-8' },
     [{ error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' }.to_json]]
  end
end

# 미들웨어 등록
Rails.application.config.middleware.insert_before 0, RateLimiter
