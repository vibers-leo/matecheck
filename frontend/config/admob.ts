/**
 * Google AdMob Configuration
 *
 * 광고 수익화 설정
 * OKR 기여: 수익 모델 구축
 */

import { Platform } from 'react-native';
import { CONFIG } from '../constants/Config';

/**
 * AdMob App ID
 * AdMob Console에서 발급받은 앱 ID
 */
export const ADMOB_APP_ID = Platform.select({
  ios: 'ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY', // iOS App ID (AdMob에서 발급)
  android: 'ca-app-pub-XXXXXXXXXXXXXXXX~ZZZZZZZZZZ', // Android App ID (AdMob에서 발급)
});

/**
 * AdMob Ad Unit IDs
 * 광고 단위별 ID (AdMob Console에서 생성)
 */
export const AD_UNIT_IDS = {
  // 배너 광고 (화면 하단)
  banner: {
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/1111111111',
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/2222222222',
  },

  // 전면 광고 (화면 전체)
  interstitial: {
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/3333333333',
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/4444444444',
  },

  // 리워드 광고 (보상형)
  reward: {
    ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/5555555555',
    android: 'ca-app-pub-XXXXXXXXXXXXXXXX/6666666666',
  },
};

/**
 * 테스트 광고 단위 ID
 * 개발 중에는 테스트 ID 사용
 */
export const TEST_AD_UNIT_IDS = {
  banner: {
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
  },
  interstitial: {
    ios: 'ca-app-pub-3940256099942544/4411468910',
    android: 'ca-app-pub-3940256099942544/1033173712',
  },
  reward: {
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
  },
};

/**
 * 현재 환경에 맞는 광고 단위 ID 반환
 */
export const getAdUnitId = (adType: keyof typeof AD_UNIT_IDS): string => {
  const isProduction = CONFIG.APP_ENV === 'production';
  const adUnits = isProduction ? AD_UNIT_IDS : TEST_AD_UNIT_IDS;

  return Platform.select({
    ios: adUnits[adType].ios,
    android: adUnits[adType].android,
  }) || '';
};

/**
 * 광고 표시 여부
 * 프리미엄 사용자는 광고 없음
 */
export const shouldShowAds = (isPremiumUser: boolean): boolean => {
  // 개발 모드에서는 광고 안 보임
  if (CONFIG.APP_ENV === 'development') {
    return false;
  }

  // 프리미엄 사용자는 광고 없음
  return !isPremiumUser;
};
