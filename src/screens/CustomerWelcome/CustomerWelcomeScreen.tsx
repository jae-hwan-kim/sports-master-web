// src/screens/CustomerWelcome/CustomerWelcomeScreen.tsx
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { LinearGradient } from 'expo-linear-gradient'

import { RootStackParamList } from '@/navigation/RootNavigator'
import { ArrowNextIcon } from '@/assets/icons'
import bgImage from '@/assets/icons/background.png'

// 이 화면은 서버 상태를 조회하거나 변경하지 않는 순수 전환 화면입니다.
// (회원가입/로그인 직후 완료 안내 → 홈으로 라우팅만 수행)
// 제공된 엔드포인트 중 이 화면 목적(가입 완료 안내, 홈 이동)에 대응하는 API가 없어 연동을 생략합니다.
export function CustomerWelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  // insets.top/insets.bottom은 런타임에만 알 수 있는 동적 값이라 style 사용이 불가피한 의도적 예외
  const insets = useSafeAreaInsets()

  const handlePress = () => {
    navigation.navigate('Home')
  }

  return (
    <Pressable
      className="flex-1"
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="눌러서 홈으로 이동"
      accessibilityHint="홈 화면으로 이동합니다"
    >
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

        {/* Figma: 타이틀 top=170(다른 화면과 동일한 안전영역 54 기준 → insets.top+116),
            버튼 하단 여백=117(캔버스 바닥 기준 → insets.bottom+117) */}
        <View className="flex-1 px-[44px]" style={{ paddingTop: insets.top + 116 }}>
          <Text className="text-center font-pretendard-extrabold text-[28px] leading-[36px] text-white">
            &apos;운동명인&apos;과{'\n'}명품 운동을 시작합니다
          </Text>

          {/* 타이틀-버튼 사이 여백 — 버튼은 항상 하단에 고정, 타이틀은 항상 상단에 고정 */}
          <View className="flex-1" />

          <View
            className="flex-row items-center gap-1 self-end"
            style={{ marginBottom: insets.bottom + 117 }}
          >
            <Text className="font-pretendard-semibold text-[12px] text-[#F2F2F2]">
              눌러서 홈으로
            </Text>
            <ArrowNextIcon color="#F2F2F2" />
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  )
}
