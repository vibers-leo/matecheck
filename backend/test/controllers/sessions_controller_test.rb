require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(email: "login@example.com", password: "password123", nickname: "로그인테스터")
  end

  test "로그인 성공" do
    post "/login", params: { email: @user.email, password: "password123" }
    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "Login successful", json["message"]
    assert_equal @user.email, json["user"]["email"]
  end

  test "로그인 성공 시 nest 정보 포함" do
    nest = Nest.create!(name: "테스트 보금자리", invite_code: "LOGIN1")
    @user.update!(nest: nest, nest_status: "active")

    post "/login", params: { email: @user.email, password: "password123" }
    assert_response :success
    json = JSON.parse(response.body)
    assert_not_nil json["nest"]
    assert_equal nest.name, json["nest"]["name"]
    assert_equal nest.invite_code, json["nest"]["invite_code"]
  end

  test "잘못된 비밀번호로 로그인 실패" do
    post "/login", params: { email: @user.email, password: "wrong" }
    assert_response :unauthorized
    json = JSON.parse(response.body)
    assert_equal "이메일 또는 비밀번호가 올바르지 않습니다.", json["error"]
  end

  test "존재하지 않는 이메일로 로그인 실패" do
    post "/login", params: { email: "nobody@example.com", password: "password123" }
    assert_response :unauthorized
  end

  test "빈 파라미터로 로그인 실패" do
    post "/login", params: {}
    assert_response :unauthorized
  end
end
