import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useState } from 'react'
import { ActivityIndicator, FlatList, Modal, Pressable, View } from 'react-native'

import { ArrowNextIcon, SettingsIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ScreenHeader } from '@/components/ScreenHeader'
import { TextField } from '@/components/TextField'
import { useLogout } from '@/hooks/useLogout'
import { useWithdraw } from '@/hooks/useWithdraw'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore } from '@/store/authStore'

import LogoSvg from '../../assets/icons/logo.svg'

type SettingItem = {
  id: string
  label: string
  onPress: () => void
}

export function MasterSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const logout = useLogout()
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdraw()
  const socialProvider = useAuthStore((s) => s.socialProvider)
  const [logoutVisible, setLogoutVisible] = useState(false)
  const [withdrawVisible, setWithdrawVisible] = useState(false)
  const [withdrawPasswordVisible, setWithdrawPasswordVisible] = useState(false)
  const [withdrawPassword, setWithdrawPassword] = useState('')

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
    { id: 'withdraw', label: '계정탈퇴', onPress: () => setWithdrawVisible(true) },
  ]

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      <ScreenHeader onBack={() => navigation.goBack()} rightIcon={<SettingsIcon size={44} />} />

      <Text className="pl-[26px] pb-[29px] pt-[20px] text-[28px] font-extrabold text-[#07091C]">설정</Text>

      <FlatList
        data={SETTINGS_ITEMS}
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

      {/* 로고 워터마크 — Figma 1125-5014: left=200, top=560, w=276, h=278 */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 200,
          top: 560,
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
        onConfirm={() => {
          setWithdrawVisible(false)
          if (socialProvider !== null) {
            withdraw({})
          } else {
            setWithdrawPasswordVisible(true)
          }
        }}
        onCancel={() => setWithdrawVisible(false)}
      />

      <Modal
        visible={withdrawPasswordVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setWithdrawPasswordVisible(false)
          setWithdrawPassword('')
        }}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-[340px] rounded-2xl bg-white px-5 pb-6 pt-11">
            <Text className="text-center text-popup-lg font-semibold text-black">비밀번호 확인</Text>
            <Text className="mt-4 text-center text-small3 font-medium text-gray2">
              탈퇴를 위해 비밀번호를 입력해주세요
            </Text>
            <View className="mt-6">
              <TextField
                label="비밀번호"
                value={withdrawPassword}
                onChangeText={setWithdrawPassword}
                secureToggle
                secureTextEntry
              />
            </View>
            <View className="mt-12 w-full flex-row gap-2">
              <Pressable
                hitSlop={8}
                disabled={isWithdrawing || !withdrawPassword}
                onPress={() => withdraw({ password: withdrawPassword })}
                accessibilityRole="button"
                accessibilityLabel="탈퇴"
                className={`h-[50px] flex-1 items-center justify-center rounded-lg bg-primary ${
                  isWithdrawing || !withdrawPassword ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {isWithdrawing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-main font-medium text-white">탈퇴</Text>
                )}
              </Pressable>
              <Pressable
                hitSlop={8}
                disabled={isWithdrawing}
                onPress={() => {
                  setWithdrawPasswordVisible(false)
                  setWithdrawPassword('')
                }}
                accessibilityRole="button"
                accessibilityLabel="취소"
                className={`h-[50px] flex-1 items-center justify-center rounded-lg border border-dialogBorder bg-dialogBg ${
                  isWithdrawing ? 'opacity-50' : 'opacity-100'
                }`}
              >
                <Text className="text-main font-medium text-white">취소</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
