require "test_helper"

class MissionTest < ActiveSupport::TestCase
  # --- belongs_to :nest ---

  test "mission은 nest에 속함" do
    mission = missions(:one)
    assert_not_nil mission.nest
    assert_equal nests(:one), mission.nest
  end

  # --- has_many :mission_assignments ---

  test "mission은 여러 mission_assignments를 가짐" do
    mission = missions(:one)
    assert_respond_to mission, :mission_assignments
    assert mission.mission_assignments.count >= 1
  end

  test "mission 삭제 시 mission_assignments도 삭제됨" do
    mission = missions(:one)
    assignment_count = mission.mission_assignments.count
    assert assignment_count > 0, "테스트를 위해 assignment가 있어야 함"

    assert_difference("MissionAssignment.count", -assignment_count) do
      mission.destroy
    end
  end

  # --- has_many :assignees through :mission_assignments ---

  test "mission은 assignees(users)를 through 관계로 가짐" do
    mission = missions(:one)
    assert_respond_to mission, :assignees
    assert_includes mission.assignees, users(:one)
  end

  test "mission에 assignee 추가 가능" do
    mission = missions(:one)
    new_user = users(:two)

    assert_difference("MissionAssignment.count", 1) do
      mission.assignees << new_user unless mission.assignees.include?(new_user)
    end
  end

  # --- 기본 속성 ---

  test "mission 생성 시 기본 속성 확인" do
    nest = nests(:one)
    mission = Mission.create!(title: "새 미션", nest: nest, is_completed: false)
    assert_equal "새 미션", mission.title
    assert_equal false, mission.is_completed
    assert_equal nest, mission.nest
  end
end
