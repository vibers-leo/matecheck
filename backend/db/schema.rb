# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_01_26_093649) do
  create_table "anniversaries", force: :cascade do |t|
    t.date "anniversary_date"
    t.string "category"
    t.datetime "created_at", null: false
    t.boolean "is_recurring"
    t.integer "nest_id", null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_anniversaries_on_nest_id"
  end

  create_table "announcements", force: :cascade do |t|
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "published_at"
    t.string "title"
    t.datetime "updated_at", null: false
  end

  create_table "calendar_events", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "creator_id"
    t.date "date"
    t.date "end_date"
    t.string "event_type"
    t.string "image_url"
    t.integer "nest_id", null: false
    t.string "time"
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_calendar_events_on_nest_id"
  end

  create_table "chore_rotations", force: :cascade do |t|
    t.string "chore_name"
    t.datetime "created_at", null: false
    t.integer "current_assignee_id"
    t.integer "nest_id", null: false
    t.date "next_rotation_date"
    t.string "rotation_type"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_chore_rotations_on_nest_id"
  end

  create_table "goals", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "current"
    t.string "goal_type"
    t.integer "nest_id", null: false
    t.integer "target"
    t.string "title"
    t.string "unit"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_goals_on_nest_id"
  end

  create_table "house_rules", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.boolean "is_active"
    t.integer "nest_id", null: false
    t.integer "priority"
    t.string "rule_type"
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_house_rules_on_nest_id"
  end

  create_table "life_infos", force: :cascade do |t|
    t.datetime "application_end"
    t.datetime "application_start"
    t.string "category"
    t.text "content"
    t.datetime "created_at", null: false
    t.string "gender"
    t.string "image_url"
    t.integer "max_age"
    t.integer "min_age"
    t.string "occupation"
    t.datetime "official_date"
    t.integer "priority"
    t.datetime "published_at"
    t.string "region"
    t.string "source_url"
    t.string "target_audience"
    t.string "title"
    t.datetime "updated_at", null: false
  end

  create_table "mission_assignments", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "mission_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["mission_id"], name: "index_mission_assignments_on_mission_id"
    t.index ["user_id"], name: "index_mission_assignments_on_user_id"
  end

  create_table "missions", force: :cascade do |t|
    t.integer "assigned_to"
    t.datetime "created_at", null: false
    t.string "image_url"
    t.boolean "is_completed"
    t.integer "nest_id", null: false
    t.string "repeat"
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_missions_on_nest_id"
  end

  create_table "nests", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "image_url"
    t.string "invite_code"
    t.string "name"
    t.integer "theme_id"
    t.datetime "updated_at", null: false
  end

  create_table "split_bills", force: :cascade do |t|
    t.string "bill_type"
    t.datetime "created_at", null: false
    t.date "due_date"
    t.boolean "is_paid"
    t.integer "nest_id", null: false
    t.string "split_method"
    t.string "title"
    t.decimal "total_amount"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_split_bills_on_nest_id"
  end

  create_table "support_tickets", force: :cascade do |t|
    t.string "category"
    t.boolean "completed"
    t.text "content"
    t.datetime "created_at", null: false
    t.string "email"
    t.string "title"
    t.datetime "updated_at", null: false
    t.integer "user_id"
  end

  create_table "transactions", force: :cascade do |t|
    t.decimal "amount"
    t.string "category"
    t.datetime "created_at", null: false
    t.date "date"
    t.integer "nest_id", null: false
    t.integer "payer_id"
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_transactions_on_nest_id"
  end

  create_table "users", force: :cascade do |t|
    t.integer "avatar_id"
    t.date "birth_date"
    t.datetime "created_at", null: false
    t.string "email"
    t.string "gender"
    t.string "member_type"
    t.integer "nest_id"
    t.string "nest_status", default: "active"
    t.string "nickname"
    t.string "occupation"
    t.string "password_digest"
    t.string "region"
    t.datetime "updated_at", null: false
  end

  create_table "wishlist_items", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "nest_id", null: false
    t.integer "price"
    t.string "quantity"
    t.integer "requester_id"
    t.string "status"
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["nest_id"], name: "index_wishlist_items_on_nest_id"
  end

  add_foreign_key "anniversaries", "nests"
  add_foreign_key "calendar_events", "nests"
  add_foreign_key "chore_rotations", "nests"
  add_foreign_key "goals", "nests"
  add_foreign_key "house_rules", "nests"
  add_foreign_key "mission_assignments", "missions"
  add_foreign_key "mission_assignments", "users"
  add_foreign_key "missions", "nests"
  add_foreign_key "split_bills", "nests"
  add_foreign_key "transactions", "nests"
  add_foreign_key "wishlist_items", "nests"
end
