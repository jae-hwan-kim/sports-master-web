import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'

import { ArrowNextIcon } from '@/assets/icons'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useLogout } from '@/hooks/useLogout'
import { useWithdraw } from '@/hooks/useWithdraw'
import { RootStackParamList } from '@/navigation/RootNavigator'

import LogoSvg from '../../assets/icons/logo.svg'

type SettingItem = {
  id: string
  label: string
  onPress: () => void
  danger?: boolean
}

export function MasterSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const logout = useLogout()
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdraw()
  const [logoutVisible, setLogoutVisible] = useState(false)
  const [withdrawVisible, setWithdrawVisible] = useState(false)

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
    { id: 'logout', label: '로그아웃', onPress: () => setLogoutVisible(true) },
    { id: 'withdraw', label: '계정탈퇴', onPress: () => setWithdrawVisible(true), danger: true },
  ]

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      <ScreenHeader onBack={() => navigation.goBack()} />

      <Text className="px-6 pb-[27px] pt-[34px] text-[28px] font-extrabold text-black">설정</Text>

      <FlatList
        data={SETTINGS_ITEMS}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        renderItem={({ item }) => (
          <Pressable
            hitSlop={8}
            onPress={item.onPress}
            className="flex-row items-center justify-between bg-[#F2F2F2] px-6"
            style={{
              height: 72,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <Text
              className={`text-[16px] font-semibold ${item.danger ? 'text-[#EA4335]' : 'text-[#07091C]'}`}
            >
              {item.label}
            </Text>
            <ArrowNextIcon size={44} />
          </Pressable>
        )}
      />

      {/* 로고 워터마크 — Figma 1125-5014: left=200, top=560, w=276, h=278 */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 200,
          bottom: 36,
          width: 276,
          height: 278,
          overflow: 'hidden',
        }}
      >
        <LogoSvg width={276} height={278} />
      </View>

      <ConfirmDialog
        visible={logoutVisible}
        title="로그아웃 하시겠습니까?"
        description="모든 정보는 그대로 유지됩니다"
        confirmLabel="로그아웃"
        cancelLabel="취소"
        onConfirm={() => {
          setLogoutVisible(false)
          logout()
        }}
        onCancel={() => setLogoutVisible(false)}
      />

      <ConfirmDialog
        visible={withdrawVisible}
        title="정말 탈퇴 하시겠습니까?"
        description="탈퇴 시 모든 정보와 기록은 사라집니다"
        confirmLabel="탈퇴"
        cancelLabel="취소"
        confirmLoading={isWithdrawing}
        onConfirm={() => withdraw({})}
        onCancel={() => setWithdrawVisible(false)}
      />
    </View>
  )
}
