require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  # --- 회원가입 (POST /signup) ---

  test "회원가입 성공" do
    assert_difference("User.count", 1) do
      post "/signup", params: {
        user: { email: "newuser@example.com", password: "password123", nickname: "새사용자" }
      }
    end
    assert_response :created
    json = JSON.parse(response.body)
    assert_equal "User created successfully", json["message"]
    assert_equal "newuser@example.com", json["user"]["email"]
  end

  test "중복 이메일로 회원가입 실패" do
    User.create!(email: "exists@example.com", password: "password123", nickname: "기존유저")

    assert_no_difference("User.count") do
      post "/signup", params: {
        user: { email: "exists@example.com", password: "password123", nickname: "중복유저" }
      }
    end
    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json["errors"].any? { |e| e.include?("Email") }
  end

  test "짧은 비밀번호로 회원가입 실패" do
    assert_no_difference("User.count") do
      post "/signup", params: {
        user: { email: "short@example.com", password: "12345", nickname: "짧은비번" }
      }
    end
    assert_response :unprocessable_entity
    json = JSON.parse(response.body)
    assert json["errors"].any? { |e| e.include?("Password") }
  end

  # --- 프로필 수정 (PATCH /profile) ---

  test "프로필 수정 성공" do
    user = User.create!(email: "profile@example.com", password: "password123", nickname: "원래닉네임")

    patch "/profile", params: {
      email: user.email,
      user: { nickname: "새닉네임" }
    }, headers: { "Authorization" => user.email }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "Profile updated", json["message"]
  end

  # --- 비밀번호 변경 (PUT /users/password) ---

  test "비밀번호 변경 성공" do
    user = User.create!(email: "pwchange@example.com", password: "password123", nickname: "비번변경")

    put "/users/password", params: {
      email: user.email,
      current_password: "password123",
      new_password: "newpassword456",
      new_password_confirmation: "newpassword456"
    }, headers: { "Authorization" => user.email }

    assert_response :success
    json = JSON.parse(response.body)
    assert_equal "Password updated successfully", json["message"]
  end

  test "현재 비밀번호 틀리면 변경 실패" do
    user = User.create!(email: "pwfail@example.com", password: "password123", nickname: "비번실패")

    put "/users/password", params: {
      email: user.email,
      current_password: "wrongpassword",
      new_password: "newpassword456",
      new_password_confirmation: "newpassword456"
    }, headers: { "Authorization" => user.email }

    assert_response :unauthorized
  end

  # --- 계정 삭제 (DELETE /users) ---

  test "계정 삭제 성공" do
    user = User.create!(email: "delete@example.com", password: "password123", nickname: "삭제유저")

    assert_difference("User.count", -1) do
      delete "/users", params: {
        email: user.email,
        password: "password123"
      }, headers: { "Authorization" => user.email }
    end
    assert_response :success
  end

  test "잘못된 비밀번호로 계정 삭제 실패" do
    user = User.create!(email: "nodelete@example.com", password: "password123", nickname: "삭제실패")

    assert_no_difference("User.count") do
      delete "/users", params: {
        email: user.email,
        password: "wrongpassword"
      }, headers: { "Authorization" => user.email }
    end
    assert_response :unauthorized
  end
end
