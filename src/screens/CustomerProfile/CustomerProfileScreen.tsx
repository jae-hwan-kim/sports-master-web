// src/screens/CustomerProfile/CustomerProfileScreen.tsx
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ArrowNextIcon, ProfilePersonIcon } from '@/assets/icons'
import { RootStackParamList } from '@/navigation/RootNavigator'

// ---------------------------------------------------------------------------
// Mock (DEV only)
// ---------------------------------------------------------------------------
type CustomerProfile = {
  nickname: string
  userTag: string
  avatarUri?: string
}

const MOCK_CUSTOMER_PROFILE: CustomerProfile = {
  nickname: '닉네임',
  userTag: '#USER00001',
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Avatar() {
  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full"
      style={{ width: 60, height: 60, backgroundColor: '#C6A75E' }}
    >
      {/* size=36 → 높이는 비율 유지(≈43) — 원은 overflow-hidden이 잘라줌 */}
      <ProfilePersonIcon size={36} />
    </View>
  )
}

type MenuRowProps = {
  label: string
  onPress: () => void
  showTopDivider?: boolean
}

function MenuRow({ label, onPress, showTopDivider = false }: MenuRowProps) {
  return (
    <>
      {showTopDivider && <View style={{ height: 1, backgroundColor: '#F2F2F2' }} />}
      <Pressable
        hitSlop={8}
        onPress={onPress}
        className="flex-row items-center justify-between px-4"
        style={{ height: 50, backgroundColor: '#FFFFFF', borderRadius: 8 }}
      >
        <Text className="text-[14px]" style={{ fontFamily: 'Pretendard-Medium', color: '#1F2A43' }}>
          {label}
        </Text>
        <ArrowNextIcon size={20} color="#1F2A43" />
      </Pressable>
    </>
  )
}

type SectionProps = {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <View className="mx-4 mt-6">
      <Text
        className="mb-2 text-[16px]"
        style={{ fontFamily: 'Pretendard-SemiBold', color: '#1F2A43' }}
      >
        {title}
      </Text>
      <View className="gap-2">{children}</View>
    </View>
  )
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export function CustomerProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const insets = useSafeAreaInsets()
  const profile = __DEV__ ? MOCK_CUSTOMER_PROFILE : null

  const handleAccountSettings = () => {
    navigation.navigate('CustomerSettings')
  }

  const handleFavoriteExperts = () => {
    // TODO: 찜한 명인 목록 화면으로 이동
  }

  const handleWriteReview = () => {
    // TODO: 리뷰 작성 화면으로 이동
  }

  const handleMyReviews = () => {
    // TODO: 내가 쓴 리뷰 목록 화면으로 이동
  }

  return (
    <View className="flex-1 bg-[#F2F2F2]" style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="mt-6 px-[26px]">
          <Text
            className="text-[28px]"
            style={{ fontFamily: 'Pretendard-ExtraBold', color: '#07091C' }}
          >
            프로필
          </Text>
          <Text
            className="mt-[10px] text-[13px]"
            style={{ fontFamily: 'Pretendard-Medium', color: '#74768E' }}
          >
            내 정보와 리뷰를 관리합니다
          </Text>
        </View>

        {/* Profile Card */}
        {profile && (
          <View
            className="mx-4 mt-6 flex-row items-center rounded-[12px] p-4"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            {/* Avatar */}
            <Avatar />

            {/* Nickname + Tag */}
            <View className="ml-3 flex-1 justify-center">
              <Text
                className="text-[16px]"
                style={{ fontFamily: 'Pretendard-SemiBold', color: '#1F2A43' }}
              >
                {profile.nickname}
              </Text>
              <Text
                className="mt-[2px] text-[12px]"
                style={{ fontFamily: 'Pretendard-Medium', color: '#C6A75E' }}
              >
                {profile.userTag}
              </Text>
            </View>

            {/* 계정설정 chip */}
            <Pressable
              hitSlop={8}
              onPress={handleAccountSettings}
              className="items-center justify-center rounded-full px-3"
              style={{ height: 32, backgroundColor: '#C6A75E' }}
            >
              <Text
                className="text-[12px]"
                style={{ fontFamily: 'Pretendard-SemiBold', color: '#FFFFFF' }}
              >
                계정설정
              </Text>
            </Pressable>
          </View>
        )}

        {/* 관심명인 section */}
        <Section title="관심명인">
          <MenuRow label="내가 찜한 명인 보러가기" onPress={handleFavoriteExperts} />
        </Section>

        {/* 리뷰관리 section */}
        <Section title="리뷰관리">
          <MenuRow label="리뷰 작성하기" onPress={handleWriteReview} />
          <MenuRow label="내가 쓴 리뷰 보기" onPress={handleMyReviews} />
        </Section>
      </ScrollView>
    </View>
  )
}
