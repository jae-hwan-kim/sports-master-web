import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { apiClient } from '@/api/client'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ScreenHeader } from '@/components/ScreenHeader'
import { TextField } from '@/components/TextField'
import { useLogout } from '@/hooks/useLogout'
import { RootStackParamList } from '@/navigation/RootNavigator'
import type { components } from '@/types/schema'

type UserResponseDto = components['schemas']['UserResponseDto']

async function fetchMe(): Promise<UserResponseDto> {
  const { data } = await apiClient.get<{ data: UserResponseDto }>('/users/me')
  return data.data
}

export function MasterPhoneChangeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()
  const logout = useLogout()

  const { data: me } = useQuery({ queryKey: ['me'], queryFn: fetchMe })

  const [newPhone, setNewPhone] = useState('')
  const [logoutVisible, setLogoutVisible] = useState(false)

  const handleVerify = () => {
    // TODO: BE 미지원 — 번호 인증 API 연동 필요
  }

  const handleAllDeviceLogout = async () => {
    setLogoutVisible(false)
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // 서버 실패 시에도 로컬 클리어 진행
    }
    logout()
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F2F2F2]"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* 타이틀 */}
        <View className="px-6 pt-[34px]">
          <Text className="text-[28px] font-extrabold text-[#07091C]">휴대전화 변경</Text>
          <Text className="mt-[14px] text-[13px] font-medium text-[#74768E]">
            개인정보는 상대방에게 노출되지 않습니다
          </Text>
        </View>

        {/* 필드 카드 */}
        <View className="mt-[27px] bg-white px-6 py-[20px]">
          {/* 기존 번호 */}
          <Text className="text-[14px] font-semibold text-[#1F2A43]">기존 번호</Text>
          <Text className="mt-[8px] text-[14px] font-medium text-[#1F2A43]">
            {me?.phone ?? '-'}
          </Text>

          {/* 구분선 */}
          <View className="my-[20px] h-[1px] bg-[#E9E9E9]" />

          {/* 변경할 번호 입력 */}
          <Text className="mb-[8px] text-[14px] font-semibold text-[#1F2A43]">변경할 번호 입력</Text>
          <TextField
            keyboardType="phone-pad"
            placeholder="010-0000-0000"
            value={newPhone}
            onChangeText={setNewPhone}
            rightButton={
              <Pressable
                hitSlop={8}
                onPress={handleVerify}
                className="h-[32px] items-center justify-center rounded-[4px] bg-[#C6A75E] px-3"
              >
                <Text className="text-[13px] font-semibold text-white">번호 인증하기</Text>
              </Pressable>
            }
          />
        </View>
      </ScrollView>

      {/* 모든 기기에서 로그아웃 */}
      <Pressable
        hitSlop={8}
        onPress={() => setLogoutVisible(true)}
        style={{ paddingBottom: insets.bottom + 16, paddingTop: 16, alignItems: 'center' }}
      >
        <Text className="text-center text-[13px] font-medium text-[#74768E]">
          모든 기기에서 로그아웃
        </Text>
      </Pressable>

      {/* 모든 기기 로그아웃 확인 */}
      <ConfirmDialog
        visible={logoutVisible}
        title="전체 로그아웃 할까요?"
        description="로그인된 모든 기기에서 로그아웃 됩니다"
        confirmLabel="로그아웃"
        cancelLabel="취소"
        onConfirm={handleAllDeviceLogout}
        onCancel={() => setLogoutVisible(false)}
      />
    </KeyboardAvoidingView>
  )
}
