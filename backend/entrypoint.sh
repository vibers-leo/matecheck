#!/bin/bash
set -e

# Rails 고질적인 server.pid 잔존 문제 해결
# 컨테이너 재시작 시 이전 PID 파일이 남아 서버가 뜨지 않는 현상 방지
rm -f /rails/tmp/pids/server.pid

# DB 마이그레이션 (테이블 없으면 생성, 있으면 migrate만 실행)
bundle exec rails db:prepare

exec "$@"
