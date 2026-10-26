import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'

import { ArrowNextIcon } from '@/assets/icons'
import { type AccountExitAction, AccountExitDialogs } from '@/components/AccountExitDialogs'
import { Text } from '@/components/AppText'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { RootStackParamList } from '@/navigation/RootNavigator'

import LogoSvg from '../../assets/icons/logo.svg'

// Figma 276×278의 80% — 큰 기기 기준 최대 크기
const LOGO_WIDTH = 220
const LOGO_HEIGHT = 222

type SettingItem = {
  id: string
  label: string
  onPress: () => void
}

export function MasterSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useScreenInsets()
  const [exitAction, setExitAction] = useState<AccountExitAction>(null)
  const [logoAreaHeight, setLogoAreaHeight] = useState(0)
  // 계정탈퇴와 최소 16 간격 확보, 공간이 너무 작으면 숨김
  const logoFitHeight = logoAreaHeight - insets.bottom - 36 - 16
  const logoSize =
    logoFitHeight < 80 ? 0 : Math.min(LOGO_WIDTH, logoFitHeight * (LOGO_WIDTH / LOGO_HEIGHT))

  const SETTINGS_ITEMS: SettingItem[] = [
    {
      id: 'profile',
      label: '개인 정보 관리',
      onPress: () => navigation.navigate('MasterProfileEdit'),
    },
    {
      id: 'guide',
      label: '기본 문구 가이드라인',
      onPress: () => navigation.navigate('MasterMessageGuide'),
    },
    { id: 'logout', label: '로그아웃', onPress: () => setExitAction('logout') },
    { id: 'withdraw', label: '계정탈퇴', onPress: () => setExitAction('withdraw') },
  ]

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      <ScreenHeader onBack={() => navigation.goBack()} />

      <Text className="pb-[29px] pl-[26px] pt-[20px] text-[28px] font-extrabold text-[#07091C]">
        설정
      </Text>

      <FlatList
        data={SETTINGS_ITEMS}
        scrollEnabled={false}
        className="grow-0"
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        renderItem={({ item }) => (
          <Pressable
            hitSlop={8}
            onPress={item.onPress}
            className="flex-row items-center justify-between bg-[#F2F2F2] pl-6 pr-[4px]"
            style={{
              height: 72,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text className="text-[16px] font-semibold text-[#07091C]">{item.label}</Text>
            <ArrowNextIcon size={44} />
          </Pressable>
        )}
      />

      {/* 로고 워터마크 — Figma 1125-5014(276×278, 화면 하단 36 위, 계정탈퇴 아래).
          목록 아래 남은 공간 안에서만 그려서 작은 기기에서도 계정탈퇴 버튼을 덮지 않음 */}
      <View
        pointerEvents="none"
        className="flex-1 overflow-hidden"
        onLayout={(e) => setLogoAreaHeight(e.nativeEvent.layout.height)}
      >
        {logoSize > 0 && (
          <View className="absolute right-[-30px]" style={{ bottom: insets.bottom + 36 }}>
            <LogoSvg width={logoSize} height={logoSize * (LOGO_HEIGHT / LOGO_WIDTH)} />
          </View>
        )}
      </View>

      <AccountExitDialogs action={exitAction} onClose={() => setExitAction(null)} />
    </View>
  )
}
