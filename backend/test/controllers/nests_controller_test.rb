require "test_helper"

class NestsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(email: "nesttest@example.com", password: "password123", nickname: "보금자리테스터")
  end

  # --- 보금자리 생성 (POST /nests) ---

  test "보금자리 생성 성공" do
    assert_difference("Nest.count", 1) do
      post "/nests", params: {
        email: @user.email,
        nest: { name: "우리집", theme_id: 1 }
      }, headers: { "Authorization" => @user.email }
    end
    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "우리집", json["name"]
    assert_not_nil json["invite_code"]
  end

  test "보금자리 생성 시 사용자가 자동으로 nest에 배정됨" do
    post "/nests", params: {
      email: @user.email,
      nest: { name: "새보금자리", theme_id: 2 }
    }, headers: { "Authorization" => @user.email }

    assert_response :created
    @user.reload
    assert_not_nil @user.nest_id
    assert_equal "active", @user.nest_status
  end

  # --- 초대코드로 가입 (POST /nests/join) ---

  test "유효한 초대코드로 보금자리 가입 요청 성공" do
    nest = Nest.create!(name: "가입대상", invite_code: "JOIN01")

    post "/nests/join", params: {
      email: @user.email,
      invite_code: "JOIN01"
    }, headers: { "Authorization" => @user.email }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "pending", json["status"]

    @user.reload
    assert_equal nest.id, @user.nest_id
    assert_equal "pending", @user.nest_status
  end

  test "잘못된 초대코드로 가입 실패" do
    post "/nests/join", params: {
      email: @user.email,
      invite_code: "INVALID"
    }, headers: { "Authorization" => @user.email }

    assert_response :not_found
    json = JSON.parse(response.body)
    assert_equal "Invalid invite code", json["error"]
  end

  # --- 보금자리 조회 (GET /nests/:id) ---

  test "소속된 보금자리 조회 성공" do
    nest = Nest.create!(name: "내보금자리", invite_code: "SHOW01")
    @user.update!(nest: nest, nest_status: "active")

    get "/nests/#{nest.id}", headers: { "Authorization" => @user.email }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "내보금자리", json["name"]
    assert_equal "SHOW01", json["invite_code"]
  end

  test "소속되지 않은 보금자리 조회 시 403 반환" do
    other_nest = Nest.create!(name: "남의보금자리", invite_code: "OTHER1")

    get "/nests/#{other_nest.id}", headers: { "Authorization" => @user.email }

    assert_response :forbidden
    json = JSON.parse(response.body)
    assert_equal "이 보금자리에 접근 권한이 없습니다.", json["error"]
  end

  # --- 인증 없이 접근 ---

  test "인증 헤더 없이 보금자리 생성 시 401 반환" do
    post "/nests", params: { nest: { name: "무인증" } }

    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal "인증이 필요합니다.", json["error"]
  end
end
