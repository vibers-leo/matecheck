require "test_helper"

class UserTest < ActiveSupport::TestCase
  # --- 이메일 검증 ---

  test "이메일 없이 사용자 생성 실패" do
    user = User.new(password: "password123", nickname: "테스터")
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "중복 이메일로 사용자 생성 실패" do
    User.create!(email: "duplicate@example.com", password: "password123", nickname: "원본")
    duplicate = User.new(email: "duplicate@example.com", password: "password123", nickname: "복제")
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:email], "has already been taken"
  end

  test "유효한 이메일로 사용자 생성 성공" do
    user = User.new(email: "valid@example.com", password: "password123", nickname: "테스터")
    assert user.valid?
  end

  # --- 비밀번호 검증 ---

  test "비밀번호 6자 미만이면 생성 실패" do
    user = User.new(email: "short@example.com", password: "12345", nickname: "테스터")
    assert_not user.valid?
    assert user.errors[:password].any? { |msg| msg.include?("too short") }
  end

  test "비밀번호 6자 이상이면 생성 성공" do
    user = User.new(email: "long@example.com", password: "123456", nickname: "테스터")
    assert user.valid?
  end

  # --- has_secure_password ---

  test "has_secure_password 인증 성공" do
    user = User.create!(email: "auth@example.com", password: "password123", nickname: "테스터")
    assert user.authenticate("password123")
  end

  test "has_secure_password 잘못된 비밀번호로 인증 실패" do
    user = User.create!(email: "auth2@example.com", password: "password123", nickname: "테스터")
    assert_not user.authenticate("wrongpassword")
  end

  # --- belongs_to :nest (optional) ---

  test "nest 없이 사용자 생성 가능" do
    user = User.new(email: "nonest@example.com", password: "password123", nickname: "테스터")
    assert_nil user.nest
    assert user.valid?
  end

  test "nest에 속한 사용자" do
    user = users(:one)
    assert_not_nil user.nest
    assert_equal nests(:one), user.nest
  end

  # --- member_type에 따른 검증 우회 ---

  test "pet 타입 멤버는 이메일 없이 생성 가능" do
    nest = nests(:one)
    member = User.new(nickname: "고양이", member_type: "pet", nest: nest, nest_status: "active")
    assert member.valid?, "pet 타입 멤버가 이메일 없이도 유효해야 함: #{member.errors.full_messages}"
  end

  test "baby 타입 멤버는 비밀번호 없이 생성 가능" do
    nest = nests(:one)
    member = User.new(nickname: "아기", member_type: "baby", nest: nest, nest_status: "active")
    assert member.valid?, "baby 타입 멤버가 비밀번호 없이도 유효해야 함: #{member.errors.full_messages}"
  end

  test "human 타입 멤버는 이메일과 비밀번호 필수" do
    user = User.new(nickname: "사람", member_type: "human")
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "member_type nil인 경우 이메일과 비밀번호 필수 (기본 human 취급)" do
    user = User.new(nickname: "사람")
    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end
end
