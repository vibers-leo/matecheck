/**
 * Reward Ad Hook
 *
 * 리워드 광고 시청 후 프리미엄 기능 24시간 무료 제공
 */

import { useState, useEffect } from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { getAdUnitId } from '../config/admob';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export const useRewardAd = () => {
  const [loaded, setLoaded] = useState(false);
  const [rewardedAd, setRewardedAd] = useState<RewardedAd | null>(null);

  useEffect(() => {
    // 리워드 광고 생성
    const ad = RewardedAd.createForAdRequest(getAdUnitId('reward'), {
      requestNonPersonalizedAdsOnly: false,
    });

    // 광고 로드 완료 이벤트
    const unsubscribeLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setLoaded(true);
        console.log('📊 [AdMob] Reward ad loaded');
      }
    );

    // 광고 시청 완료 (보상 지급)
    const unsubscribeEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('🎁 [AdMob] User earned reward:', reward);
        showSuccessToast(
          '프리미엄 기능이 24시간 동안 활성화되었습니다!',
          '🎁 보상 획득'
        );

        // TODO: 프리미엄 기능 24시간 활성화 로직
        // 예: userStore에 premiumUntil = Date.now() + 24 * 60 * 60 * 1000
      }
    );

    // 광고 로드
    ad.load();

    setRewardedAd(ad);

    // Cleanup
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
    };
  }, []);

  /**
   * 리워드 광고 표시
   */
  const showRewardAd = async () => {
    if (!loaded || !rewardedAd) {
      showErrorToast('광고를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      await rewardedAd.show();
      setLoaded(false);

      // 광고 재로드
      const newAd = RewardedAd.createForAdRequest(getAdUnitId('reward'));
      newAd.load();
      setRewardedAd(newAd);
    } catch (error) {
      console.error('📊 [AdMob] Failed to show reward ad:', error);
      showErrorToast('광고를 표시할 수 없습니다.');
    }
  };

  return {
    loaded,
    showRewardAd,
  };
};
