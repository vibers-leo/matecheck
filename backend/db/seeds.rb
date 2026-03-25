# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# Seed Announcements
if Announcement.count.zero?
  Announcement.create!([
    {
      title: "MateCheck 1.0 정식 오픈! 🎉",
      content: "안녕하세요! MateCheck을 찾아주신 여러분 감사합니다. 룸메이트와의 건강한 동거 생활을 위한 첫 발걸음을 함께 해주세요.",
      published_at: Time.current
    },
    {
      title: "방장(Nest Master) 시스템 안내 👑",
      content: "보금자리를 만든 분은 자동으로 '방장'이 됩니다. 방장만 목표와 규칙을 설정할 수 있어요. 건강한 공동 생활의 리더가 되어주세요!",
      published_at: Time.current - 1.day
    },
    {
      title: "새 기능: 집안일 로테이션 🔄",
      content: "설거지, 청소 등 집안일을 공정하게 나눌 수 있는 로테이션 기능이 추가되었습니다. 일정 화면에서 확인해보세요.",
      published_at: Time.current - 2.days
    }
  ])
end

# Seed LifeInfo
if LifeInfo.count.zero?
  LifeInfo.create!([
    {
      title: "2026년 귀농/귀촌 지원사업 가이드 🌾",
      content: "성공적인 귀농/귀촌을 위한 정부 지원금 신청 방법과 교육 프로그램을 확인하세요. \n\n1. 청년창업농 영농정착지원사업: 월 최대 110만원 지원\n2. 귀농 농업창업 및 주택구입지원: 저금리 융자 지원",
      category: "farming",
      image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef",
      source_url: "https://www.returnfarm.com",
      target_audience: "all",
      published_at: Time.current
    },
    {
      title: "청년 월세 특별 지원 (2차) 🏠",
      content: "만 19세~34세 독립 거주 무주택 청년을 위한 월세 지원사업이 연장되었습니다. 생애 1회만 가능하며, 월 최대 20만원까지 12개월간 지원받을 수 있습니다.",
      category: "youth",
      image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa",
      source_url: "https://www.bokjiro.go.kr",
      target_audience: "youth",
      published_at: Time.current - 1.day
    },
    {
      title: "다문화 가족 지원 센터 프로그램 안내 👨‍👩‍👧‍👦",
      content: "한국어 교육, 자녀 양육 상담 등 다문화 가족의 안정적인 정착을 돕는 다양한 프로그램이 준비되어 있습니다.",
      category: "family",
      image_url: "https://images.unsplash.com/photo-1511895426328-dc8714191300",
      source_url: "https://www.liveinkorea.kr",
      target_audience: "family",
      published_at: Time.current - 2.days
    },
    {
      title: "올바른 분리수거 방법: 비닐류 편 ♻️",
      content: "라면 봉지, 과자 봉지 등 비닐류는 반드시 이물질을 제거하고 흩날리지 않게 모아서 배출해야 합니다.",
      category: "living",
      image_url: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b",
      source_url: "https://me.go.kr",
      target_audience: "all",
      published_at: Time.current - 3.days
    }
  ])
end
