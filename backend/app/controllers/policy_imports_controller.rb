class PolicyImportsController < ApplicationController
  skip_before_action :authenticate_user!

  # POST /policy_imports
  def create
    unless params[:file].present?
      return render json: { error: 'CSV 파일을 선택해주세요.' }, status: :bad_request
    end

    binary_data = params[:file].read
    csv_text = detect_and_convert_encoding(binary_data)

    begin
      csv = CSV.parse(csv_text, headers: true)
    rescue CSV::MalformedCSVError => e
      return render json: { error: "CSV 파싱 오류: #{e.message}" }, status: :unprocessable_entity
    end

    required_headers = ['제목']
    missing = required_headers - csv.headers
    if missing.any?
      return render json: { error: "필수 컬럼 누락: #{missing.join(', ')}" }, status: :unprocessable_entity
    end

    success_count = 0
    skipped_count = 0
    error_records = []

    csv.each_with_index do |row, index|
      title = row['제목']&.strip
      next if title.blank?

      # 중복 방지
      if LifeInfo.exists?(title: title)
        skipped_count += 1
        next
      end

      info = LifeInfo.new(
        title: title,
        content: row['내용']&.strip,
        category: row['카테고리']&.strip || 'living',
        source_url: row['URL']&.strip,
        region: row['지역']&.strip,
        target_audience: row['대상']&.strip,
        published_at: Time.current
      )

      if info.save
        success_count += 1
      else
        error_records << { row: index + 2, errors: info.errors.full_messages }
      end
    end

    render json: {
      message: "#{success_count}건 임포트, #{skipped_count}건 건너뜀",
      success_count: success_count,
      skipped_count: skipped_count,
      error_count: error_records.size,
      errors: error_records
    }
  end

  # GET /policy_imports/sample
  def sample
    csv_data = CSV.generate(encoding: 'UTF-8') do |csv|
      csv << ['제목', '내용', '카테고리', '대상', '지역', 'URL']
      csv << ['청년 월세 지원', '월 최대 20만원 지원', 'youth', '만 19-34세', '서울', 'https://example.com']
    end

    send_data "\xEF\xBB\xBF" + csv_data,
              filename: "정책_임포트_샘플.csv",
              type: 'text/csv; charset=utf-8',
              disposition: 'attachment'
  end

  private

  def detect_and_convert_encoding(binary_data)
    begin
      text = binary_data.force_encoding('UTF-8')
      return text if text.valid_encoding?
    rescue; end

    begin
      return binary_data.force_encoding('EUC-KR').encode('UTF-8')
    rescue; end

    begin
      return binary_data.force_encoding('CP949').encode('UTF-8')
    rescue; end

    binary_data.force_encoding('UTF-8').encode('UTF-8', invalid: :replace, undef: :replace, replace: '?')
  end
end
