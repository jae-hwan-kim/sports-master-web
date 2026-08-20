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
    { id: 'profile', label: '개인정보 관리', onPress: () => navigation.navigate('MasterProfileEdit') },
    { id: 'guide', label: '기본 문구 가이드라인', onPress: () => navigation.navigate('MasterMessageGuide') },
    { id: 'logout', label: '로그아웃', onPress: () => setLogoutVisible(true) },
    { id: 'withdraw', label: '계정탈퇴', onPress: () => setWithdrawVisible(true), danger: true },
  ]

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      <ScreenHeader onBack={() => navigation.goBack()} />

      <FlatList
        data={SETTINGS_ITEMS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            hitSlop={8}
            onPress={item.onPress}
            className="flex-row items-center justify-between border-b border-gray1 bg-white px-6 py-5"
          >
            <Text className={`text-[16px] font-medium ${item.danger ? 'text-[#EA4335]' : 'text-black'}`}>
              {item.label}
            </Text>
            <ArrowNextIcon size={44} />
          </Pressable>
        )}
      />

      <ConfirmDialog
        visible={logoutVisible}
        title="로그아웃"
        description="로그아웃 하시겠습니까?"
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
        title="계정탈퇴"
        description="탈퇴 완료 하시겠습니까?"
        confirmLabel="탈퇴"
        cancelLabel="취소"
        confirmLoading={isWithdrawing}
        onConfirm={() => withdraw({})}
        onCancel={() => setWithdrawVisible(false)}
      />
    </View>
  )
}
