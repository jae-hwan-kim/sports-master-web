import masterBg from '../../assets/icons/master-background.png'

import { useQuery } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { Alert, FlatList, ImageBackground, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'

import { apiClient } from '@/api/client'
import type { DiagnosisIncomingItem } from '@/api/diagnosis'
import { formatDate } from '@/utils/date'
import { ArrowNextIcon, LinkIcon, SettingsIcon, StarMedalIcon } from '@/assets/icons'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DiagnosisRequestCard } from '@/components/DiagnosisRequestCard'
import { useRootNavigation } from '@/hooks/useRootNavigation'
import { useSwitchMode } from '@/hooks/useSwitchMode'
import { useAuthStore } from '@/store/authStore'
import type { components } from '@/types/schema'

type ExpertProfileResponseDto = components['schemas']['ExpertProfileResponseDto']

const GRADE_LABEL: Record<string, string> = {
  bronze: '브론즈',
  silver: '실버메달',
  gold: '스타메달',
  platinum: '플래티넘',
  diamond: '다이아몬드',
}

async function fetchExpertGrade(): Promise<ExpertProfileResponseDto> {
  const { data } = await apiClient.get<{ data: ExpertProfileResponseDto }>('/home/expert-grade')
  return data.data
}

async function fetchDiagnosisPreview(): Promise<DiagnosisIncomingItem[]> {
  const { data } = await apiClient.get<{ data: DiagnosisIncomingItem[] }>('/home/diagnosis-requests/preview')
  return data.data
}


function MasterModeBadge({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      disabled={disabled}
      style={{
        width: 80,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1C236E',
        backgroundColor: '#07091C',
        overflow: 'hidden',
        justifyContent: 'center',
      }}
    >
      <LinearGradient
        colors={['rgb(24,30,93)', 'rgb(32,40,127)']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: 'absolute',
          top: 2,
          left: 3,
          bottom: 2,
          width: 36,
          borderRadius: 8,
        }}
      />
      <Text
        style={{
          color: '#F2F2F2',
          fontSize: 7,
          fontFamily: 'Pretendard-Medium',
          paddingLeft: 8,
        }}
      >
        명인모드
      </Text>
    </Pressable>
  )
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ width: 56, alignItems: 'center', gap: 8 }}>
      <Text
        style={{ color: '#F2F2F2', fontSize: 18, fontFamily: 'Pretendard-ExtraBold', textAlign: 'center' }}
      >
        {value}
      </Text>
      <Text
        style={{ color: '#F2F2F2', fontSize: 13, fontFamily: 'Pretendard-Medium', textAlign: 'center' }}
      >
        {label}
      </Text>
    </View>
  )
}

function StatDivider() {
  return (
    <View
      style={{
        width: 1,
        height: 38,
        backgroundColor: 'rgba(255,255,255,0.4)',
        alignSelf: 'center',
        marginHorizontal: 20,
      }}
    />
  )
}

function EmptyNoProfile() {
  return (
    <View
      style={{
        borderRadius: 8,
        backgroundColor: '#D9D9D9',
        height: 278,
        width: 338,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <Text style={{ color: '#74768E', fontSize: 18, fontFamily: 'Pretendard-ExtraBold', textAlign: 'center' }}>
        아직 요청 고객이 없습니다
      </Text>
      <Text style={{ color: '#74768E', fontSize: 13, fontFamily: 'Pretendard-Medium', textAlign: 'center' }}>
        프로필을 작성해 전문성을 보여주세요!
      </Text>
      <Pressable
        hitSlop={8}
        onPress={() => Alert.alert('준비 중', '프로필 작성 기능을 준비 중입니다.')}
        style={{
          marginTop: 12,
          backgroundColor: '#C6A75E',
          borderRadius: 8,
          height: 50,
          width: 145,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#F2F2F2', fontSize: 17, fontFamily: 'Pretendard-Medium' }}>
          프로필 작성하기
        </Text>
      </Pressable>
    </View>
  )
}

function EmptyHasTip() {
  return (
    <View
      style={{
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 180,
        gap: 8,
      }}
    >
      <Text style={{ color: '#74768E', fontSize: 14, fontFamily: 'Pretendard-Medium', textAlign: 'center' }}>
        Tip.
      </Text>
      <Text style={{ color: '#74768E', fontSize: 13, fontFamily: 'Pretendard-Regular', textAlign: 'center', lineHeight: 20 }}>
        {'링크를 통해 외부 고객도 리뷰 작성이 가능합니다\n리뷰 점수를 높여 고객요청 확률을 높여봅시다!'}
      </Text>
    </View>
  )
}

export function MasterHomeScreen() {
  const insets = useSafeAreaInsets()
  const rootNav = useRootNavigation()
  const setModeSelected = useAuthStore((s) => s.setModeSelected)
  const { mutate: switchMode, isPending: isSwitching } = useSwitchMode()
  const [linkCopyVisible, setLinkCopyVisible] = useState(false)

  const { data: expertProfile, isError: expertProfileError } = useQuery({
    queryKey: ['expertGrade'],
    queryFn: fetchExpertGrade,
    retry: false,
  })

  const { data: diagnosisItems = [] } = useQuery({
    queryKey: ['diagnosisPreview'],
    queryFn: fetchDiagnosisPreview,
  })

  const hasProfile = expertProfile !== undefined && !expertProfileError
  const gradeLabel = expertProfile?.expertGrade ? (GRADE_LABEL[expertProfile.expertGrade] ?? expertProfile.expertGrade) : '-'
  const reviewCount = expertProfile ? String(expertProfile.totalReviewCount > 999 ? '999+' : expertProfile.totalReviewCount) : '-'
  const avgRating = expertProfile ? String(Number(expertProfile.averageRating).toFixed(1)) : '-'
  const topPercentile = expertProfile?.topPercentile != null ? `${expertProfile.topPercentile}%` : '-'

  const handleModeSwitch = () => {
    switchMode({ mode: 'customer' }, {
      onSuccess: () => {
        setModeSelected('customer')
        rootNav?.reset({ index: 0, routes: [{ name: 'CustomerHome' }] })
      },
    })
  }

  const handleReviewLink = () => {
    // TODO: 실제 리뷰 링크 생성은 chatRoomId 필요 — 채팅 기능 개발 시 교체
    setLinkCopyVisible(true)
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#1E2A3A' }}>
      {/* 상단 배경 사진 영역 */}
      <ImageBackground
        source={masterBg}
        resizeMode="cover"
        style={{ paddingTop: insets.top }}
      >
        {/* 전체 dark 오버레이 */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(7,9,28,0.5)',
          }}
        />
        {/* 상단 흰색 그라디언트 오버레이 */}
        <LinearGradient
          colors={['#F2F2F2', 'rgba(242,242,242,0)']}
          locations={[0, 1]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, pointerEvents: 'none' }}
        />

        {/* 내비게이션 바 */}
        <View
          style={{ height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 16, gap: 8 }}
        >
          <MasterModeBadge onPress={handleModeSwitch} disabled={isSwitching} />
          <Pressable
            hitSlop={8}
            onPress={() => rootNav?.navigate('MasterSettings')}
            accessibilityRole="button"
            accessibilityLabel="설정"
          >
            <SettingsIcon size={44} color="#F2F2F2" />
          </Pressable>
        </View>

        {/* 리뷰 링크 배너 */}
        <Pressable
          hitSlop={8}
          onPress={handleReviewLink}
          style={{
            height: 54,
            marginHorizontal: 16,
            borderRadius: 8,
            backgroundColor: 'rgba(7,9,28,0.6)',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 3,
          }}
        >
          <LinkIcon size={44} color="#FFFFFF" />
          <Text
            style={{ flex: 1, color: '#F2F2F2', fontSize: 13, fontFamily: 'Pretendard-Medium' }}
          >
            내 고객이라면 누구나 리뷰 작성 가능
          </Text>
          <Text
            style={{ color: '#D9D9D9', fontSize: 13, fontFamily: 'Pretendard-Medium', paddingRight: 12 }}
          >
            링크 보내기
          </Text>
        </Pressable>

        {/* 명인 등급 카드 */}
        <View
          style={{
            height: 175,
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 13,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <LinearGradient
            colors={['rgba(7,9,28,0.6)', 'rgba(87,103,125,0.6)']}
            style={{ position: 'absolute', inset: 0 } as object}
          />

          <View style={{ position: 'absolute', right: 0, top: 0 }}>
            <StarMedalIcon size={100} />
          </View>

          <View style={{ flex: 1, paddingLeft: 16, paddingTop: 18, justifyContent: 'space-between', paddingBottom: 24 }}>
            <View>
              <Text style={{ color: '#F2F2F2', fontSize: 18, fontFamily: 'Pretendard-ExtraBold' }}>
                명인 등급
              </Text>
              <Text
                style={{ color: '#D9D9D9', fontSize: 13, fontFamily: 'Pretendard-Medium', marginTop: 7 }}
              >
                현재 명인 등급{' '}
                <Text style={{ color: '#FBBC05' }}>{gradeLabel}</Text>
                {' '}입니다
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginLeft: 16 }}>
              <StatBox value={reviewCount} label="리뷰" />
              <StatDivider />
              <StatBox value={avgRating} label="평점" />
              <StatDivider />
              <StatBox value={topPercentile} label="상위" />
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* 하단 진단요청 고객 섹션 */}
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
          paddingTop: 23,
        }}
      >
        {/* 섹션 헤더 — paddingLeft:32, paddingRight:25 → Figma 화살표 좌:333 우:25 여백 */}
        <Pressable
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 32, paddingRight: 25, marginBottom: 16 }}
        >
          <View>
            <Text style={{ color: '#1F2A43', fontSize: 18, fontFamily: 'Pretendard-ExtraBold' }}>
              진단요청 고객
            </Text>
            <Text
              style={{ color: '#74768E', fontSize: 13, fontFamily: 'Pretendard-Medium', marginTop: 6 }}
            >
              나를 찾는 고객 프로필 전부 확인하기
            </Text>
          </View>
          <ArrowNextIcon size={44} />
        </Pressable>

        {/* 진단요청 목록 */}
        <FlatList
          data={diagnosisItems}
          keyExtractor={(item) => String(item.id)}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 32 }}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item }) => (
            <DiagnosisRequestCard item={item} onPress={() => {}} />
          )}
          ListEmptyComponent={hasProfile ? <EmptyHasTip /> : <EmptyNoProfile />}
          ListFooterComponent={
            diagnosisItems.length > 0 ? (
              <Text
                style={{
                  color: 'rgba(116,118,142,0.5)',
                  fontSize: 10,
                  fontFamily: 'Pretendard-Medium',
                  textAlign: 'right',
                  marginTop: 16,
                  paddingBottom: 16,
                }}
              >
                가장 먼저 요청한 3인이 보여집니다
              </Text>
            ) : null
          }
        />
      </View>

      {/* 링크 복사 확인 다이얼로그 */}
      <ConfirmDialog
        visible={linkCopyVisible}
        title="링크 복사 완료"
        description="링크가 클립보드에 복사되었습니다"
        confirmLabel="확인"
        onConfirm={() => setLinkCopyVisible(false)}
      />
    </View>
  )
}
