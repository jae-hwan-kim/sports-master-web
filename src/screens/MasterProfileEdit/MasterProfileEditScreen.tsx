import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ArrowNextIcon } from '@/assets/icons'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useLogout } from '@/hooks/useLogout'
import { RootStackParamList } from '@/navigation/RootNavigator'
import { useAuthStore } from '@/store/authStore'

type BlockedField = 'phone' | 'email' | 'password' | null

const BLOCKED_DIALOG: Record<NonNullable<BlockedField>, { title: string; description: string }> = {
  phone: { title: '전화번호 변경 불가', description: '소셜 로그인은 전화번호 변경 불가합니다' },
  email: { title: '이메일 변경 불가', description: '소셜 로그인은 메일 주소 변경 불가합니다' },
  password: { title: '비밀번호 변경 불가', description: '소셜 로그인은 비밀번호 변경 불가합니다' },
}

export function MasterProfileEditScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()
  const socialProvider = useAuthStore((s) => s.socialProvider)
  const isSocial = socialProvider !== null && socialProvider !== 'local'
  const logout = useLogout()

  const [blockedField, setBlockedField] = useState<BlockedField>(null)
  const [allDeviceLogoutVisible, setAllDeviceLogoutVisible] = useState(false)

  const handleFieldPress = (field: BlockedField) => {
    if (isSocial && field) {
      setBlockedField(field)
      return
    }
    // TODO: 일반 로그인 — 각 필드 편집 화면으로 이동
  }

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      <ScreenHeader onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {/* 타이틀 */}
        <View className="px-6 pt-[34px]">
          <Text className="text-[28px] font-extrabold text-black">개인 정보 관리</Text>
          <Text className="mt-[14px] text-[13px] font-medium text-gray2">
            개인정보는 상대방에게 노출되지 않습니다
          </Text>
        </View>

        {/* 필드 목록 */}
        <View className="mt-[27px]">
          <ProfileField
            label="휴대전화 번호"
            value="010-0000-0000"
            onPress={() => handleFieldPress('phone')}
          />
          <ProfileField
            label="이메일"
            value="yourid@example.com"
            onPress={() => handleFieldPress('email')}
          />
          <ProfileField
            label="비밀번호"
            value="••••••••"
            onPress={() => handleFieldPress('password')}
          />
        </View>

        {/* 모든 기기에서 로그아웃 */}
        <Pressable
          hitSlop={8}
          onPress={() => setAllDeviceLogoutVisible(true)}
          className="mt-8 items-center"
        >
          <Text className="text-[13px] font-medium text-gray2">모든 기기에서 로그아웃</Text>
        </Pressable>
      </ScrollView>

      {/* 소셜 변경 불가 다이얼로그 */}
      <ConfirmDialog
        visible={blockedField !== null}
        title={blockedField ? BLOCKED_DIALOG[blockedField].title : ''}
        description={blockedField ? BLOCKED_DIALOG[blockedField].description : ''}
        onConfirm={() => setBlockedField(null)}
      />

      {/* 모든 기기 로그아웃 확인 */}
      <ConfirmDialog
        visible={allDeviceLogoutVisible}
        title="모든 기기에서 로그아웃"
        description="모든 기기에서 로그아웃 하시겠습니까?"
        confirmLabel="로그아웃"
        cancelLabel="취소"
        onConfirm={() => {
          setAllDeviceLogoutVisible(false)
          logout()
        }}
        onCancel={() => setAllDeviceLogoutVisible(false)}
      />
    </View>
  )
}

function ProfileField({
  label,
  value,
  onPress,
}: {
  label: string
  value: string
  onPress: () => void
}) {
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      className="flex-row items-center justify-between px-6"
      style={{ height: 84, backgroundColor: '#F2F2F2', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}
    >
      <View className="gap-1">
        <Text className="text-[16px] font-medium text-gray2">{label}</Text>
        <Text className="text-[16px] font-semibold text-gray3">{value}</Text>
      </View>
      <ArrowNextIcon size={44} />
    </Pressable>
  )
}
