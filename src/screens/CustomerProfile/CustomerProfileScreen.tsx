// src/screens/CustomerProfile/CustomerProfileScreen.tsx
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { useState } from 'react'
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from 'react-native'

import { ArrowNextIcon, ProfilePersonIcon } from '@/assets/icons'
import { type AccountExitAction, AccountExitDialogs } from '@/components/AccountExitDialogs'
import { Text } from '@/components/AppText'
import { useCustomerProfile } from '@/hooks/useCustomerProfile'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { RootStackParamList } from '@/navigation/RootNavigator'

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// 기본 아바타 — 피그마(마이페이지_Default): 골드 원 + 연한 실루엣(#F2F2F2), 몸통은 원 아래에서 잘림, 원 아래 옅은 그림자
// 실루엣 치수: 원(80) 대비 몸통 폭 ≈70%(56), 머리 상단 ≈16px 아래
function Avatar() {
  return (
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#C6A75E',
        overflow: 'hidden',
        ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
          android: { elevation: 3 },
        }),
      }}
    >
      <ProfilePersonIcon size={56} color="#F2F2F2" style={{ position: 'absolute', left: 12, top: 16 }} />
    </View>
  )
}

type MenuRowProps = {
  label: string
  onPress: () => void
  showTopDivider?: boolean
  // 디자인 그림자 값 — 관심명인·리뷰 행은 #000 5%, 계정 행은 기존 값(11%)
  shadowOpacity?: number
}

function MenuRow({ label, onPress, showTopDivider = false, shadowOpacity = 0.11 }: MenuRowProps) {
  return (
    <>
      {showTopDivider && <View style={{ height: 1, backgroundColor: '#F2F2F2' }} />}
      <Pressable
        hitSlop={8}
        onPress={onPress}
        className="flex-row items-center justify-between px-4"
        style={{
          height: 46,
          backgroundColor: '#F2F2F2',
          borderRadius: 4,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 2, height: 2 },
              shadowOpacity,
              shadowRadius: 2.9,
            },
            android: { elevation: 2 },
          }),
        }}
      >
        <Text className="text-[12px]" style={{ fontFamily: 'Pretendard-Medium', color: '#1F2A43' }}>
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
    <View className="mx-[26px] mt-6">
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
  const insets = useScreenInsets()
  const { data: profile, isLoading, isError } = useCustomerProfile()
  const [exitAction, setExitAction] = useState<AccountExitAction>(null)

  const handleAccountSettings = () => {
    navigation.navigate('CustomerSettings')
  }

  const handleFavoriteExperts = () => {
    navigation.navigate('FavoriteExperts')
  }

  const handleWriteReview = () => {
    navigation.navigate('ReviewWrite')
  }

  const handleMyReviews = () => {
    navigation.navigate('MyReviews')
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
            style={{ fontFamily: 'Pretendard-ExtraBold', color: '#1F2A43' }}
          >
            프로필
          </Text>
          <Text
            className="mt-[10px] text-[12px]"
            style={{ fontFamily: 'Pretendard-Medium', color: '#74768E' }}
          >
            내 정보와 리뷰를 관리합니다
          </Text>
        </View>

        {/* Profile Card */}
        {isLoading ? (
          <View
            className="mx-[26px] mt-6 items-center justify-center rounded-[12px] py-[36px]"
            style={{
              backgroundColor: '#FFFFFF',
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 1, height: 1 },
                  shadowOpacity: 0.18,
                  shadowRadius: 6,
                },
                android: { elevation: 3 },
              }),
            }}
          >
            <ActivityIndicator size="small" color="#B48247" />
          </View>
        ) : isError ? (
          <View
            className="mx-[26px] mt-6 items-center justify-center rounded-[12px] py-[36px]"
            style={{
              backgroundColor: '#FFFFFF',
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 1, height: 1 },
                  shadowOpacity: 0.18,
                  shadowRadius: 6,
                },
                android: { elevation: 3 },
              }),
            }}
          >
            <Text
              className="text-[14px]"
              style={{ fontFamily: 'Pretendard-Medium', color: '#74768E' }}
            >
              프로필 정보를 불러오지 못했습니다
            </Text>
          </View>
        ) : profile ? (
          <View
            className="mx-[26px] mt-6 flex-row items-center rounded-[12px] px-[20px] py-[20px]"
            style={{
              backgroundColor: '#FFFFFF',
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 1, height: 1 },
                  shadowOpacity: 0.18,
                  shadowRadius: 6,
                },
                android: { elevation: 3 },
              }),
            }}
          >
            {/* Avatar */}
            <Avatar />

            {/* Nickname + Tag */}
            <View className="ml-[20px] flex-1 justify-center">
              <Text
                className="text-[20px]"
                style={{ fontFamily: 'Pretendard-SemiBold', color: '#07091C' }}
              >
                {profile.nickname || profile.name}
              </Text>
              <Text
                className="mt-[2px] text-[14px]"
                style={{
                  fontFamily: 'Pretendard-Medium',
                  color: '#B48247',
                  textDecorationLine: 'underline',
                }}
              >
                {`#USER${String(profile.userId).padStart(5, '0')}`}
              </Text>
            </View>

            {/* 계정설정 chip */}
            <Pressable
              hitSlop={8}
              onPress={handleAccountSettings}
              className="h-[24px] items-center justify-center rounded-full bg-[#B48247] px-3"
            >
              <Text
                className="text-[12px]"
                style={{ fontFamily: 'Pretendard-Medium', color: '#F2F2F2' }}
              >
                계정설정
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* 관심명인 section */}
        <Section title="관심명인">
          <MenuRow label="내가 저장한 명인 보러가기" shadowOpacity={0.05} onPress={handleFavoriteExperts} />
        </Section>

        {/* 리뷰관리 section */}
        <Section title="리뷰관리">
          <MenuRow label="리뷰 작성하기" shadowOpacity={0.05} onPress={handleWriteReview} />
          <MenuRow label="내가 작성한 리뷰 보기" shadowOpacity={0.05} onPress={handleMyReviews} />
        </Section>

        {/* 계정 — Figma 미정의, 고객 모드의 로그아웃/탈퇴 진입점 (명인 설정과 동일 동작) */}
        <Section title="계정">
          <MenuRow label="로그아웃" onPress={() => setExitAction('logout')} />
          <MenuRow label="계정탈퇴" onPress={() => setExitAction('withdraw')} />
        </Section>
      </ScrollView>

      <AccountExitDialogs action={exitAction} onClose={() => setExitAction(null)} />
    </View>
  )
}
