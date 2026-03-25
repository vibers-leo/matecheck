namespace :crawler do
  desc "Fetch and update life information from external sources"
  task sync: :environment do
    puts "Starting crawler..."
    count = PolicyCrawlerService.crawl_all.count
    puts "Completed! Synced #{count} new items."
  end
end
