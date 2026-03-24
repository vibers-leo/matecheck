require "test_helper"

class NestTest < ActiveSupport::TestCase
  # --- has_many 연관관계 ---

  test "nest는 여러 users를 가짐" do
    nest = nests(:one)
    assert_respond_to nest, :users
    assert nest.users.count >= 1
  end

  test "nest는 여러 missions를 가짐" do
    nest = nests(:one)
    assert_respond_to nest, :missions
  end

  test "nest는 여러 calendar_events를 가짐" do
    nest = nests(:one)
    assert_respond_to nest, :calendar_events
  end

  test "nest는 여러 goals를 가짐" do
    nest = nests(:one)
    assert_respond_to nest, :goals
  end

  test "nest는 여러 transactions를 가짐" do
    nest = nests(:one)
    assert_respond_to nest, :transactions
  end

  test "nest는 여러 split_bills를 가짐" do
    nest = nests(:one)
    assert_respond_to nest, :split_bills
  end

  test "nest는 여러 chore_rotations를 가짐" do
    nest = nests(:one)
    assert_respond_to nest, :chore_rotations
  end

  test "nest는 여러 wishlist_items를 가짐" do
    nest = nests(:one)
    assert_respond_to nest, :wishlist_items
  end

  test "nest는 여러 house_rules를 가짐" do
    nest = nests(:one)
    assert_respond_to nest, :house_rules
  end

  test "nest는 여러 anniversaries를 가짐" do
    nest = nests(:one)
    assert_respond_to nest, :anniversaries
  end

  # --- invite_code 유일성 검증 ---

  test "invite_code 중복 시 유효하지 않음" do
    existing = nests(:one)
    duplicate = Nest.new(name: "중복 보금자리", invite_code: existing.invite_code)
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:invite_code], "has already been taken"
  end

  test "invite_code가 nil이면 유효함" do
    nest = Nest.new(name: "코드 없는 보금자리", invite_code: nil)
    assert nest.valid?
  end

  test "고유한 invite_code로 보금자리 생성 성공" do
    nest = Nest.new(name: "새 보금자리", invite_code: "UNIQUE1")
    assert nest.valid?
  end

  # --- dependent: :destroy ---

  test "nest 삭제 시 missions도 삭제됨" do
    nest = nests(:one)
    mission_count = nest.missions.count
    assert mission_count > 0, "테스트를 위해 mission이 있어야 함"

    assert_difference("Mission.count", -mission_count) do
      nest.destroy
    end
  end

  test "nest 삭제 시 users는 삭제되지 않음 (dependent 설정 없음)" do
    nest = nests(:one)
    user_count = nest.users.count
    assert user_count > 0, "테스트를 위해 user가 있어야 함"

    assert_no_difference("User.count") do
      nest.destroy
    end
  end
end
