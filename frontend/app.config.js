/**
 * Expo App Configuration
 * 환경 변수를 로드하고 app.json을 대체합니다
 *
 * 참고: Expo SDK 49+ 부터 EXPO_PUBLIC_ 접두사를 사용하면
 * 클라이언트에서 자동으로 process.env로 접근 가능합니다
 */

// .env 파일 로드 (dotenv 없이도 Expo가 자동으로 로드)
// 단, app.config.js에서 사용하려면 명시적으로 로드 필요
const IS_DEV = process.env.EXPO_PUBLIC_APP_ENV === 'development';
const IS_PREVIEW = process.env.EXPO_PUBLIC_APP_ENV === 'preview';

export default {
  expo: {
    name: 'MateCheck',
    slug: 'matecheck',
    scheme: 'matecheck',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    description: '가족, 커플, 룸메이트와 함께하는 공동 생활 관리 앱',
    primaryColor: '#FF7F50',
    privacy: 'unlisted',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FF7F50',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.matecheck.juuuno',
      buildNumber: '1',
      infoPlist: {
        NSCameraUsageDescription: '프로필 사진 및 할 일 사진을 촬영하기 위해 카메라 접근이 필요합니다.',
        NSPhotoLibraryUsageDescription: '프로필 사진 및 할 일 사진을 선택하기 위해 사진 라이브러리 접근이 필요합니다.',
        NSPhotoLibraryAddUsageDescription: '사진을 저장하기 위해 사진 라이브러리 접근이 필요합니다.',
        UIBackgroundModes: ['remote-notification'],
      },
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FF7F50',
      },
      package: 'com.matecheck.juuuno',
      versionCode: 1,
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      lang: 'ko',
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-secure-store',
      'expo-asset',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static',
          },
          android: {
            enableProguardInReleaseBuilds: false,
            enableShrinkResourcesInReleaseBuilds: false,
          },
        },
      ],
    ],
    extra: {
      eas: {
        projectId: '82208c75-3db6-4496-918a-f6a8cf70d82a',
      },
      // 환경 변수를 extra에 명시적으로 전달 (선택 사항)
      // EXPO_PUBLIC_ 접두사가 있으면 자동으로 클라이언트에서 접근 가능
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      apiUrlProduction: process.env.EXPO_PUBLIC_API_URL_PRODUCTION,
      appEnv: process.env.EXPO_PUBLIC_APP_ENV,
    },
    // 환경별 설정
    updates: {
      enabled: !IS_DEV,
      fallbackToCacheTimeout: 0,
    },
  },
};
