require 'nokogiri'
require 'httparty'

class PolicyCrawlerService
  RSS_FEEDS = {
    policy: "https://www.korea.kr/rss/policy.xml",
    columns: "https://www.korea.kr/rss/column.xml",
    seoul: "https://www.seoul.go.kr/rss/seoul.xml" # Added Seoul source
  }

  REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']

  def self.crawl_all
    CrawlLog.record_execution('PolicyCrawlerService') do |log|
      crawler = new
      new_items, skipped_count, errors = crawler.crawl_feeds

      SlackNotifierService.notify_crawling_result({
        new_count: new_items.count,
        skipped_count: skipped_count,
        duration: log.duration_seconds || 0,
        errors: errors
      })

      { new_items: new_items.count, skipped_count: skipped_count, errors: errors }
    end
  end

  def crawl_feeds
    results = []
    skipped = 0
    errors = []

    RSS_FEEDS.each do |key, url|
      begin
        response = HTTParty.get(url)
        next unless response.success?

        xml = Nokogiri::XML(response.body)
        items = xml.xpath('//item')

        items.each do |item|
          title = item.xpath('title').text
          link = item.xpath('link').text
          description_html = item.xpath('description').text
          description = description_html.gsub(/<[^>]*>/, '').strip
          pub_date = item.xpath('pubDate').text

          # Avoid duplicates
          if LifeInfo.exists?(title: title)
            skipped += 1
            next
          end

          image_url = extract_image(description_html)
          category = determine_category(title, description)

          # New: Extract profile matching data
          region = determine_region(title, description)
          age_range = determine_age_range(title, description)
          gender = determine_gender(title, description)
          occupation = determine_occupation(title, description)

          life_info = LifeInfo.create!(
            title: title,
            content: description,
            source_url: link,
            published_at: pub_date.present? ? Time.parse(pub_date) : Time.current,
            category: category,
            target_audience: determine_audience(title),
            image_url: image_url || get_default_image(category),
            region: region,
            min_age: age_range[:min],
            max_age: age_range[:max],
            gender: gender,
            occupation: occupation
          )

          results << life_info
        end
      rescue => e
        Rails.logger.error "Error crawling #{url}: #{e.message}"
        errors << "#{key}: #{e.message}"
      end
    end

    [results, skipped, errors]
  end

  private

  def determine_category(title, description)
    text = (title + description).downcase
    return 'youth' if text.match?(/청년|대학생|취업|인턴/)
    return 'farming' if text.match?(/귀농|농업|농촌|작물/)
    return 'family' if text.match?(/가족|육아|어린이|다문화|결혼|신혼|출산|임신/)
    return 'living'
  end

  def determine_region(title, description)
    text = (title + description)
    REGIONS.each do |r|
      return r if text.include?(r)
    end
    nil
  end

  def determine_age_range(title, description)
    text = (title + description)
    if text.include?('청년')
      { min: 19, max: 39 }
    elsif text.match?(/어린이|영유아/)
      { min: 0, max: 12 }
    elsif text.include?('노인') || text.include?('어르신')
      { min: 65, max: 120 }
    else
      { min: nil, max: nil }
    end
  end

  def determine_gender(title, description)
    text = (title + description)
    return 'female' if text.match?(/여성|임산부|엄마/)
    return 'male' if text.match?(/남성|아빠/)
    nil
  end

  def determine_occupation(title, description)
    text = (title + description)
    return 'student' if text.match?(/대학생|취준생|학생/)
    return 'employee' if text.match?(/직장인|근로자/)
    return 'entrepreneur' if text.match?(/창업|소상공인|대표/)
    return 'farmer' if text.include?('농업') || text.include?('어업')
    nil
  end

  def determine_audience(title)
    return 'youth' if title.include?('청년')
    return 'family' if title.include?('가족')
    'all'
  end

  def extract_image(html_content)
    doc = Nokogiri::HTML(html_content)
    img = doc.css('img').first
    img ? img['src'] : nil
  end

  def get_default_image(category)
    case category
    when 'youth'
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800"
    when 'farming'
      "https://images.unsplash.com/photo-1625246333195-f8196812c85f?q=80&w=800"
    when 'family'
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800"
    else
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800"
    end
  end
end

