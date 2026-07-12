import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { LinearGradient } from 'expo-linear-gradient'
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { moderateScale } from 'react-native-size-matters'

import { RootStackParamList } from '@/navigation/RootNavigator'
import bgImage from '@/assets/icons/background.png'
import logoImage from '@/assets/icons/logo.png'

export function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()

  return (
    <ImageBackground source={bgImage} resizeMode="cover" className="flex-1 bg-black">
      <LinearGradient
        colors={['#07091C', 'rgba(7,9,28,0.7)', '#07091C']}
        locations={[0, 0.51, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View
        className="flex-1 px-[43px] "
        style={{ paddingTop: insets.top + 110, paddingBottom: insets.bottom + 114 }}
      >
        <Image
          source={logoImage}
          resizeMode="contain"
          style={{ width: moderateScale(149), height: moderateScale(195) }}
        />

        <View className="w-px bg-gray2" style={{ flexGrow: 1, marginTop: 47, marginBottom: 15 }} />

        <Text
          className="font-pretendard-extrabold leading-[34px] text-white"
          style={{ fontSize: moderateScale(28) }}
        >
          급이 다른 자격,{'\n'}품격 있는 운동의 시작
        </Text>
        <Text
          className="font-pretendard-regular mt-3 leading-[22px] text-gray2"
          style={{ fontSize: moderateScale(17) }}
        >
          물리치료사, 건강운동관리사 자격을 갖춘{'\n'}트레이닝 전문가와 기관을 탐색합니다
        </Text>

        <View className="mt-[26px] flex-row" style={{ gap: 26 }}>
          <Pressable
            hitSlop={8}
            onPress={() => navigation.navigate('Login')}
            className="flex-1 items-center justify-center rounded-lg bg-primary"
            style={{ height: 50 }}
          >
            <Text className="font-pretendard-medium text-white" style={{ fontSize: moderateScale(17) }}>
              로그인
            </Text>
          </Pressable>
          <Pressable
            hitSlop={8}
            onPress={() => navigation.navigate('SignUp')}
            className="flex-1 items-center justify-center rounded-lg border border-[#4A5198] bg-[#102343]"
            style={{ height: 50 }}
          >
            <Text className="font-pretendard-medium text-white" style={{ fontSize: moderateScale(17) }}>
              회원가입
            </Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  )
}
