Rails.application.routes.draw do
  post '/signup', to: 'users#create'
  post '/login', to: 'sessions#create'
  post '/auth/kakao', to: 'kakao_auth#create'
  patch '/profile', to: 'users#update'
  put '/users/password', to: 'users#update_password'
  delete '/users', to: 'users#destroy'
  
  resources :nests, only: [:create, :show] do
    post 'join', on: :collection
    get 'requests', on: :member
    patch 'approve/:user_id', on: :member, to: 'nests#approve'
    post 'members', on: :member, to: 'nests#add_managed_member'
    resources :missions
    resources :calendar_events
    resources :goals
    resources :transactions
    resources :anniversaries
    resources :house_rules
    resources :split_bills
    resources :wishlist_items
    resources :chore_rotations do
      member do
        post 'rotate'
      end
    end
  end
  
  resources :support_tickets, only: [:create]
  resources :announcements, only: [:index, :show]
  resources :life_infos, only: [:index, :show] do
    post 'sync', on: :collection
    get 'personalized', on: :collection
  end

  # 정책 CSV 일괄 임포트
  resources :policy_imports, only: [:create] do
    get :sample, on: :collection
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  get "health" => "rails/health#show"

  # Defines the root path route ("/")
  # root "posts#index"
end
