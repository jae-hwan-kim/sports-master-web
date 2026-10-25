// src/screens/Onboarding/OnboardingScreen.tsx
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { ImageBackground, Pressable, StyleSheet, View } from 'react-native'

import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

import bgImage from '@/assets/icons/background.png'
import logoImage from '@/assets/icons/logo.png'
import { Text } from '@/components/AppText'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { RootStackParamList } from '@/navigation/RootNavigator'

// Figma 523:1773 — 버튼 하단 ~ 홈 인디케이터 위 여백 (874 - 759.75 - 34)
const BUTTON_BOTTOM_GAP = 80

export function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useScreenInsets()

  return (
    <ImageBackground
      source={bgImage}
      resizeMode="cover"
      className="flex-1 bg-black"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      <LinearGradient
        colors={['#07091C', 'rgba(7,9,28,0.7)', '#07091C']}
        locations={[0, 0.51, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View
        className="flex-1 px-[44px]"
        style={{ paddingTop: insets.top + 56, paddingBottom: insets.bottom + BUTTON_BOTTOM_GAP }}
      >
        <Image
          source={logoImage}
          accessibilityLabel="스포츠마스터 로고"
          style={{ width: 149, height: 195 }}
        />

        <View
          // 화면이 짧으면 세로선이 줄어들어 버튼 하단 여백을 확보 (Figma 190 → 최소 24)
          className="mb-[8px] mt-[20px] max-h-[190px] min-h-[24px] w-px flex-1 bg-gray2"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        />

        <Text
          className="font-pretendard-extrabold leading-[34px] text-white"
          style={{ fontSize: 28 }}
        >
          급이 다른 자격,{'\n'}품격 있는 운동의 시작
        </Text>
        <Text
          className="mt-3 font-pretendard-regular leading-[22px] text-gray2"
          style={{ fontSize: 17 }}
        >
          물리치료사, 건강운동관리사 자격을 갖춘{'\n'}트레이닝 전문가와 기관을 탐색합니다
        </Text>

        <View className="mt-[26px] h-[50px] flex-row">
          <Pressable
            hitSlop={8}
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel="로그인"
            className="flex-1 items-center justify-center rounded-lg bg-primary"
          >
            <Text className="font-pretendard-medium text-white" style={{ fontSize: 17 }}>
              로그인
            </Text>
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => navigation.navigate('SignUp')}
            accessibilityRole="button"
            accessibilityLabel="회원가입"
            className="ml-[26px] flex-1 items-center justify-center rounded-lg border border-[#4A5198] bg-[#102343]"
          >
            <Text className="font-pretendard-medium text-white" style={{ fontSize: 17 }}>
              회원가입
            </Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  )
}
