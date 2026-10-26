import { useState } from 'react'
import { ActivityIndicator, Modal, Pressable, View } from 'react-native'

import { Text } from '@/components/AppText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TextField } from '@/components/TextField'
import { useLogout } from '@/hooks/useLogout'
import { useWithdraw } from '@/hooks/useWithdraw'
import { useAuthStore } from '@/store/authStore'

export type AccountExitAction = 'logout' | 'withdraw' | null

// 로그아웃/계정탈퇴 확인 팝업 — 명인 설정·고객 마이페이지 공용.
// 탈퇴는 소셜 계정이면 바로, 이메일 계정이면 비밀번호 확인 후 진행
export function AccountExitDialogs({
  action,
  onClose,
}: {
  action: AccountExitAction
  onClose: () => void
}) {
  const logout = useLogout()
  const { mutate: withdraw, isPending: isWithdrawing } = useWithdraw()
  const socialProvider = useAuthStore((s) => s.socialProvider)
  const [withdrawPasswordVisible, setWithdrawPasswordVisible] = useState(false)
  const [withdrawPassword, setWithdrawPassword] = useState('')
  const logoutVisible = action === 'logout'
  const withdrawVisible = action === 'withdraw'

  return (
    <>
      <ConfirmDialog
        visible={logoutVisible}
        title="로그아웃 하시겠습니까?"
        description="모든 정보는 그대로 유지됩니다"
        confirmLabel="로그아웃"
        cancelLabel="취소"
        onConfirm={() => {
          onClose()
          logout()
        }}
        onCancel={() => onClose()}
      />

      <ConfirmDialog
        visible={withdrawVisible}
        title="정말 탈퇴 하시겠습니까?"
        description="탈퇴 시 모든 정보와 기록은 사라집니다"
        confirmLabel="탈퇴"
        cancelLabel="취소"
        onConfirm={() => {
          onClose()
          if (socialProvider !== null && socialProvider !== 'local') {
            withdraw({})
          } else {
            setWithdrawPasswordVisible(true)
          }
        }}
        onCancel={() => onClose()}
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
            <Text className="text-center text-popup-lg font-semibold text-black">
              비밀번호 확인
            </Text>
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
    </>
  )
}
