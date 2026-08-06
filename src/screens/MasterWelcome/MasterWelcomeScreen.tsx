// src/screens/MasterWelcome/MasterWelcomeScreen.tsx
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { LinearGradient } from 'expo-linear-gradient'
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { moderateScale } from 'react-native-size-matters'

import { RootStackParamList } from '@/navigation/RootNavigator'
import { ArrowNextIcon } from '@/assets/icons'
import bgImage from '@/assets/icons/background.png'

export function MasterWelcomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()

  const handleGoHome = () => {
    // NOTE: 명인 인증 요청 접수 상태 표시는 Home 화면 진입 후 처리
    navigation.navigate('Home')
  }

  return (
    <Pressable onPress={handleGoHome} className="flex-1">
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

        {/* NOTE: insets는 런타임 동적 값이라 인라인 style 예외 사용.
            Figma: 타이틀 top=170(다른 화면과 동일한 안전영역 54 기준 → insets.top+116),
            버튼 하단 여백=117(캔버스 바닥 기준 → insets.bottom+117) */}
        <View
          className="flex-1 px-[44px]"
          style={{ paddingTop: insets.top + 116, paddingBottom: insets.bottom + 117 }}
        >
          <Text
            className="text-center font-pretendard-extrabold leading-9 text-white"
            style={{ fontSize: moderateScale(28) }}
          >
            명인님 환영합니다!
          </Text>

          {/* 타이틀-버튼 사이 여백 — 버튼은 항상 하단에 고정, 타이틀은 항상 상단에 고정 */}
          <View className="flex-1" />

          <Pressable
            hitSlop={{ top: 16, bottom: 16, left: 12, right: 12 }}
            onPress={handleGoHome}
            accessibilityRole="button"
            accessibilityLabel="눌러서 홈으로"
            className="flex-row items-center self-end py-3"
          >
            <Text
              className="font-pretendard-semibold text-[#F2F2F2]"
              style={{ fontSize: moderateScale(12) }}
            >
              눌러서 홈으로
            </Text>
            <ArrowNextIcon color="#F2F2F2" />
          </Pressable>
        </View>
      </ImageBackground>
    </Pressable>
  )
}
