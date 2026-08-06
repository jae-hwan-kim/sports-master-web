import { useState } from 'react'

import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { RoleCard } from '@/components/RoleCard'
import { ScreenHeader } from '@/components/ScreenHeader'
import { useSwitchMode } from '@/hooks/useSwitchMode'
import { RootStackParamList } from '@/navigation/RootNavigator'

type Role = 'master' | 'customer'

// 회원가입 완료 후 명인/고객 역할 선택 화면
// '회원가입_모드선택' / '회원가입_고객선택' / '회원가입_명인선택' 3개 프레임을 카드 순서 차이 변형으로 보고 단일 화면으로 흡수
// 카드는 1차 탭에서 바로 다음 화면으로 넘어가지 않고 선택 상태(그라데이션 보더)만 표시 —
// 이미 선택된 카드를 한 번 더 탭해야 실제로 다음 화면으로 진행
export function SignUpRoleSelectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()
  const { mutate: switchMode, isPending } = useSwitchMode()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  // 명인 모드는 서버가 ExpertProfile 존재를 요구해(BadRequestException) 가입 직후엔 전환할 수 없음 —
  // 실제 모드 전환은 자격증 인증(승인) 이후 이뤄져야 하므로, 여기서는 인증 화면으로만 이동
  const goToMasterVerification = () => {
    navigation.navigate('MasterVerification')
  }

  const confirmCustomer = () => {
    switchMode(
      { mode: 'customer' },
      {
        onSuccess: () => navigation.navigate('CustomerWelcome'),
      }
    )
  }

  const handlePressMaster = () => {
    if (selectedRole === 'master') {
      goToMasterVerification()
      return
    }
    setSelectedRole('master')
  }

  const handlePressCustomer = () => {
    if (selectedRole === 'customer') {
      confirmCustomer()
      return
    }
    setSelectedRole('customer')
  }

  return (
    <View className="flex-1 bg-[#F2F2F2]">
      <ScreenHeader onBack={() => navigation.goBack()} />

      <ScrollView
        className="flex-1 px-[26px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Title — Figma: 헤더(상단여백54+네비바56=110) 아래 34px 고정 */}
        <Text className="mt-[34px] text-[28px] font-extrabold text-black">모드선택</Text>
        <Text className="mt-2 text-[13px] font-medium text-gray2">
          전문가인 명인, 이용자인 고객 중 선택해주세요
        </Text>

        {/* Role Cards — 고정 2개, 반복 리스트 아님. 카드 간 간격 16px 고정(Figma) */}
        <View className="mt-[60px] items-center gap-4">
          <RoleCard
            variant="master"
            title="명인입니다"
            description="물리치료사, 건강운동관리사 자격증으로 명인이 될 준비가 되어있습니다"
            selected={selectedRole === 'master'}
            onPress={handlePressMaster}
            disabled={isPending}
          />
          <RoleCard
            variant="customer"
            title="고객입니다"
            description="명인과 함께 건강한 운동과 몸을 만들고 싶습니다"
            selected={selectedRole === 'customer'}
            onPress={handlePressCustomer}
            disabled={isPending}
          />
        </View>
      </ScrollView>
    </View>
  )
}
