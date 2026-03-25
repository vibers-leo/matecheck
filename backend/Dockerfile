# syntax=docker/dockerfile:1

ARG RUBY_VERSION=3.4.7
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

WORKDIR /rails

# 런타임 의존성 설치
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      curl \
      libjemalloc2 \
      libvips \
      libpq5 && \
    ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development:test" \
    LD_PRELOAD="/usr/local/lib/libjemalloc.so"

# ── 빌드 스테이지 ──────────────────────────────────────────
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential \
      git \
      libyaml-dev \
      pkg-config \
      libpq-dev && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Gem 설치
COPY Gemfile Gemfile.lock ./
RUN bundle config set frozen false && \
    bundle lock --update && \
    bundle install && \
    rm -rf ~/.bundle/ \
           "${BUNDLE_PATH}"/ruby/*/cache \
           "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# Bootsnap precompile (QEMU bug 우회: -j 1)
RUN bundle exec bootsnap precompile -j 1 --gemfile

COPY . .

RUN bundle exec bootsnap precompile -j 1 app/ lib/

# Assets precompile (SECRET_KEY_BASE_DUMMY: asset 컴파일 전용 더미값)
RUN SECRET_KEY_BASE_DUMMY=1 bundle exec rails assets:precompile

# ── 최종 스테이지 ──────────────────────────────────────────
FROM base

RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash

COPY --chown=rails:rails --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --chown=rails:rails --from=build /rails /rails

# entrypoint 복사 및 실행 권한 부여
COPY --chown=rails:rails entrypoint.sh /rails/entrypoint.sh
RUN chmod +x /rails/entrypoint.sh

USER 1000:1000

EXPOSE 8000

ENTRYPOINT ["/rails/entrypoint.sh"]
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
