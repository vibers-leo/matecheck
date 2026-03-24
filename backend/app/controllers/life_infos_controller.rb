class LifeInfosController < ApplicationController
  skip_before_action :authenticate_user!, only: [:index, :show, :sync, :personalized]

  def index
    @life_infos = LifeInfo.order(published_at: :desc)
    
    if params[:category]
      @life_infos = @life_infos.where(category: params[:category])
    end

    if params[:region]
      @life_infos = @life_infos.where("region IS NULL OR region = ?", params[:region])
    end

    if params[:age]
      age = params[:age].to_i
      @life_infos = @life_infos.where("(min_age IS NULL OR min_age <= ?) AND (max_age IS NULL OR max_age >= ?)", age, age)
    end

    if params[:occupation]
      @life_infos = @life_infos.where("occupation IS NULL OR occupation = ?", params[:occupation])
    end

    @life_infos = @life_infos.page(params[:page]).per(params[:per_page] || 20)
    render json: {
      data: @life_infos,
      meta: {
        current_page: @life_infos.current_page,
        total_pages: @life_infos.total_pages,
        total_count: @life_infos.total_count
      }
    }
  end

  def show
    @life_info = LifeInfo.find(params[:id])
    render json: @life_info
  end

  def sync
    new_items = PolicyCrawlerService.crawl_all
    render json: { message: "Synced #{new_items.count} new items", count: new_items.count }, status: :ok
  end

  def personalized
    # Simplified recommendation engine
    # In a real app, we'd find the user by id
    user = User.find_by(id: params[:user_id])
    
    query = LifeInfo.all

    if user
      # 1. Match Region
      query = query.where("region IS NULL OR region = ?", user.region) if user.region.present?
      
      # 2. Match Age
      if user.birth_date
        age = ((Time.zone.now - user.birth_date.to_time) / 1.year.seconds).floor
        query = query.where("(min_age IS NULL OR min_age <= ?) AND (max_age IS NULL OR max_age >= ?)", age, age)
      end

      # 3. Match Occupation
      query = query.where("occupation IS NULL OR occupation = ?", user.occupation) if user.occupation.present?
      
      # 4. Match Gender
      query = query.where("gender IS NULL OR gender = ?", user.gender) if user.gender.present?
    end

    @recommended = query.order(published_at: :desc).limit(20)
    render json: @recommended
  end
end

