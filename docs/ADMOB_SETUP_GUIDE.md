# Google AdMob 설정 가이드

> 모바일 앱 광고 수익화

---

## 📱 AdSense vs AdMob

| 항목 | AdSense | AdMob |
|------|---------|-------|
| 용도 | **웹사이트** | **모바일 앱** ✅ |
| 플랫폼 | 웹 | iOS + Android |
| 통합 | HTML/JS | React Native |

**MateCheck는 AdMob을 사용합니다!**

---

## 🚀 1단계: AdMob 계정 생성

### 1. AdMob Console 접속

```
https://admob.google.com
```

### 2. 계정 생성

1. Google 계정으로 로그인
2. "시작하기" 클릭
3. 국가 선택: **대한민국**
4. 통화 선택: **KRW (₩)**
5. 이용약관 동의
6. "AdMob 계정 만들기" 클릭

---

## 📱 2단계: 앱 등록

### iOS 앱 추가

1. AdMob 홈 → "앱" → "앱 추가" 클릭
2. 플랫폼: **iOS**
3. 앱이 Google Play 또는 App Store에 게시되어 있나요? **아니요** (아직 출시 전)
4. 앱 이름: **MateCheck**
5. "앱 추가" 클릭

**App ID 발급됨**:
```
ca-app-pub-1234567890123456~0987654321
```

이 ID를 `frontend/config/admob.ts`에 입력하세요!

### Android 앱 추가

1. "앱 추가" 클릭
2. 플랫폼: **Android**
3. 앱 이름: **MateCheck**
4. "앱 추가" 클릭

**App ID 발급됨**:
```
ca-app-pub-1234567890123456~1111111111
```

이것도 `admob.ts`에 입력!

---

## 🎯 3단계: 광고 단위 생성

### 배너 광고 (홈 화면 하단)

1. 앱 선택 → "광고 단위" → "광고 단위 추가" 클릭
2. 광고 형식: **배너**
3. 광고 단위 이름: **MateCheck 홈 배너**
4. "광고 단위 만들기" 클릭

**Ad Unit ID 발급됨**:
```
iOS: ca-app-pub-1234567890123456/2222222222
Android: ca-app-pub-1234567890123456/3333333333
```

### 리워드 광고 (프리미엄 체험)

1. "광고 단위 추가" 클릭
2. 광고 형식: **리워드**
3. 광고 단위 이름: **MateCheck 프리미엄 체험**
4. 보상:
   - 보상 항목: **프리미엄 기능**
   - 보상량: **1일**
5. "광고 단위 만들기" 클릭

**Ad Unit ID 발급됨**:
```
iOS: ca-app-pub-1234567890123456/4444444444
Android: ca-app-pub-1234567890123456/5555555555
```

---

## 🔧 4단계: 코드 설정

### admob.ts 업데이트

발급받은 ID로 `frontend/config/admob.ts` 파일을 업데이트하세요:

```typescript
export const ADMOB_APP_ID = Platform.select({
  ios: 'ca-app-pub-1234567890123456~0987654321', // 발급받은 iOS App ID
  android: 'ca-app-pub-1234567890123456~1111111111', // 발급받은 Android App ID
});

export const AD_UNIT_IDS = {
  banner: {
    ios: 'ca-app-pub-1234567890123456/2222222222', // 발급받은 iOS 배너 ID
    android: 'ca-app-pub-1234567890123456/3333333333', // 발급받은 Android 배너 ID
  },
  reward: {
    ios: 'ca-app-pub-1234567890123456/4444444444', // 발급받은 iOS 리워드 ID
    android: 'ca-app-pub-1234567890123456/5555555555', // 발급받은 Android 리워드 ID
  },
};
```

---

## 📲 5단계: 앱에 광고 추가

### 배너 광고 추가

홈 화면 하단에 배너 광고 추가:

```typescript
// app/toss/(tabs)/home.tsx
import AdBanner from '../../../../components/AdBanner';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* 기존 컨텐츠 */}

      {/* 배너 광고 (화면 하단) */}
      <AdBanner position="bottom" />
    </View>
  );
}
```

### 리워드 광고 추가

프리미엄 기능 안내 화면에 "광고 보고 무료 체험" 버튼:

```typescript
import { useRewardAd } from '../hooks/useRewardAd';
import { TouchableOpacity, Text } from 'react-native';

export default function PremiumScreen() {
  const { loaded, showRewardAd } = useRewardAd();

  return (
    <View>
      <Text>프리미엄 기능</Text>

      <TouchableOpacity
        onPress={showRewardAd}
        disabled={!loaded}
        style={{ backgroundColor: '#FF7F50', padding: 16 }}
      >
        <Text style={{ color: 'white' }}>
          📺 광고 보고 24시간 무료 체험
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## 💰 6단계: 수익 확인

### 광고 수익 확인

1. AdMob Console → "수익" 메뉴
2. 일별/월별 수익 확인
3. eCPM (1000회 노출당 수익) 확인

### 예상 수익

| 지표 | 한국 평균 |
|------|-----------|
| eCPM (배너) | $0.50 ~ $2.00 |
| eCPM (리워드) | $5.00 ~ $15.00 |
| 클릭률 (CTR) | 1-3% |

**계산 예시**:
- 일 활성 사용자 500명
- 1인당 평균 10회 배너 노출
- 총 5,000회 노출/일
- eCPM $1.00
- **일 수익**: $5.00 (₩6,500)
- **월 수익**: $150 (₩195,000)

---

## 🔒 7단계: app.json 설정

### iOS 설정

`app.config.js`에 AdMob App ID 추가:

```javascript
ios: {
  // ... 기존 설정
  config: {
    googleMobileAdsAppId: 'ca-app-pub-1234567890123456~0987654321',
  },
}
```

### Android 설정

```javascript
android: {
  // ... 기존 설정
  config: {
    googleMobileAdsAppId: 'ca-app-pub-1234567890123456~1111111111',
  },
}
```

---

## ✅ 8단계: 테스트

### 개발 모드 테스트

개발 중에는 **테스트 광고**가 자동으로 표시됩니다:

```typescript
// config/admob.ts
const isProduction = CONFIG.APP_ENV === 'production';
const adUnits = isProduction ? AD_UNIT_IDS : TEST_AD_UNIT_IDS; // 자동 전환
```

### 실제 광고 테스트

1. 프로덕션 빌드 생성
   ```bash
   eas build --profile production --platform all
   ```

2. 테스트 기기에 설치

3. AdMob Console → "앱" → "테스트 기기 추가"
   - 기기 IDFA (iOS) 또는 Advertising ID (Android) 입력

4. 앱 실행 후 광고 확인

---

## 💡 중요 사항

### ⚠️ 정책 준수

1. **클릭 유도 금지**
   - "광고 클릭해주세요" ❌
   - 실수로 클릭하게 만들기 ❌

2. **콘텐츠 정책**
   - 성인 콘텐츠 ❌
   - 폭력적 콘텐츠 ❌
   - 저작권 침해 ❌

3. **프리미엄 사용자 광고 제거**
   - 프리미엄 구독 시 광고 표시 안 함
   - `shouldShowAds(isPremium)` 함수로 제어

### 📊 수익 최적화

1. **배너 위치**: 화면 하단 (상단보다 클릭률 높음)
2. **리워드 광고**: 사용자에게 가치 제공 (프리미엄 체험)
3. **광고 빈도**: 너무 자주 표시하지 않기 (사용자 경험 저하)

---

## 🚀 다음 단계

AdMob 설정 완료 후:
1. ✅ 광고 수익 모델 구축 완료
2. 다음: Firebase 설정
3. 다음: 프로덕션 빌드 및 제출

---

**마지막 업데이트**: 2026-02-14
