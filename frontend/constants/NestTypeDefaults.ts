/**
 * NestTypeDefaults
 * 보금자리 유형별 기본값 정의
 *
 * OKR 기여:
 * - KR1 (만족도): 처음부터 내 상황에 맞는 앱 경험 제공
 * - KR4 (성장): 기숙사 체크리스트 → 바이럴 유입
 */

export type NestType = 'dormitory' | 'couple' | 'family';

// ─────────────────────────────────────────────
// 유형별 메타 정보
// ─────────────────────────────────────────────
export const NEST_TYPE_META: Record<NestType, {
    emoji: string;
    title: string;
    subtitle: string;
    description: string;
    color: string;
}> = {
    dormitory: {
        emoji: '🏫',
        title: '기숙사',
        subtitle: '룸메이트와 함께 사는 공간',
        description: '처음 만나는 룸메이트와\n갈등 없이 잘 지내고 싶다면',
        color: '#3182F6',
    },
    couple: {
        emoji: '💑',
        title: '커플 · 파트너',
        subtitle: '사랑하는 파트너와 함께하는 생활',
        description: '함께하는 일상을\n더 따뜻하고 행복하게',
        color: '#FF6B8A',
    },
    family: {
        emoji: '👨‍👩‍👧‍👦',
        title: '가족',
        subtitle: '소중한 가족과 함께하는 우리 집',
        description: '가족의 일상을\n체계적으로 함께 관리해요',
        color: '#2DA07A',
    },
};

// ─────────────────────────────────────────────
// 유형별 기본 규칙 (네스트 생성 시 자동 등록)
// ─────────────────────────────────────────────
export const NEST_TYPE_DEFAULT_RULES: Record<NestType, string[]> = {
    dormitory: [
        '🌙 소등 시간: 밤 12시 이후 조명 줄이기',
        '🧹 청소 당번 순서대로 주 1회 청소',
        '🚪 방문객 초대 시 하루 전 미리 알리기',
    ],
    couple: [
        '💰 생활비 (월세, 공과금) 1/N 분담',
        '📱 귀가가 늦으면 미리 연락하기',
        '🏠 주 1회 함께 집 청소하기',
    ],
    family: [
        '🕐 귀가 시간은 미리 알려주기',
        '🍽️ 주말 저녁은 온 가족이 함께',
        '💵 용돈 사용 내역 공유하기',
    ],
};

// ─────────────────────────────────────────────
// 유형별 예산 카테고리 기본값
// ─────────────────────────────────────────────
export const NEST_TYPE_BUDGET_CATEGORIES: Record<NestType, string[]> = {
    dormitory: ['식비', '청소용품', '생활용품', '기타'],
    couple: ['월세', '공과금', '식비', '데이트비', '기타'],
    family: ['식비', '교육비', '의료비', '공과금', '기타'],
};

// ─────────────────────────────────────────────
// 유형별 기능 가시성
// ─────────────────────────────────────────────
export const NEST_TYPE_FEATURES: Record<NestType, {
    showAnniversaryTab: boolean;    // 기념일 탭 표시 여부
    showChecklistBanner: boolean;   // 룸메이트 체크리스트 배너
    showAnniversaryBanner: boolean; // 기념일 D-Day 배너
    showFamilyScheduleBanner: boolean; // 가족 일정 배너
}> = {
    dormitory: {
        showAnniversaryTab: false,
        showChecklistBanner: true,
        showAnniversaryBanner: false,
        showFamilyScheduleBanner: false,
    },
    couple: {
        showAnniversaryTab: true,
        showChecklistBanner: false,
        showAnniversaryBanner: true,
        showFamilyScheduleBanner: false,
    },
    family: {
        showAnniversaryTab: true,
        showChecklistBanner: false,
        showAnniversaryBanner: false,
        showFamilyScheduleBanner: true,
    },
};
