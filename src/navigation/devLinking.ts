import type { LinkingOptions } from '@react-navigation/native'

import type { RootStackParamList } from '@/navigation/RootNavigator'

// 개발 빌드 전용 딥링크 — /device-check 가 화면별 스크린샷에 사용
// sportsmaster://dev/<ScreenName>  (ScreenName = src/screens 디렉터리명 = figma registry 의 screen)
// 프로덕션 번들에서는 undefined → 외부에서 임의 화면으로 진입 불가
export const devLinking: LinkingOptions<RootStackParamList> | undefined = __DEV__
  ? {
      prefixes: ['sportsmaster://'],
      config: {
        screens: {
          Onboarding: 'dev/Onboarding',
          Login: 'dev/Login',
          SignUp: 'dev/SignUp',
          SignUpRoleSelect: 'dev/SignUpRoleSelect',
          MasterVerification: 'dev/MasterVerification',
          CustomerWelcome: 'dev/CustomerWelcome',
          MasterWelcome: 'dev/MasterWelcome',
          CustomerSettings: 'dev/CustomerSettings',
          MasterSettings: 'dev/MasterSettings',
          MasterProfileEdit: 'dev/MasterProfileEdit',
          MasterDetailProfileEdit: 'dev/MasterDetailProfileEdit',
          MasterMessageGuide: 'dev/MasterMessageGuide',
          MasterPhoneChange: 'dev/MasterPhoneChange',
          MasterHome: {
            screens: {
              HomeTab: 'dev/MasterHome',
              DiagnosisTab: 'dev/MasterDiagnosis',
              ProfileTab: {
                screens: {
                  MasterProfile: 'dev/MasterProfile',
                  MasterDetailProfile: 'dev/MasterDetailProfile',
                  MasterReview: 'dev/MasterReview',
                },
              },
            },
          },
          CustomerHome: {
            screens: {
              CustomerHomeTab: 'dev/CustomerHome',
              CustomerExploreTab: 'dev/CustomerExplore',
              CustomerProfileTab: 'dev/CustomerProfile',
            },
          },
        },
      },
    }
  : undefined
