import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { Alert, Platform, Pressable, ScrollView, View } from 'react-native'

import { ArrowBackIcon, StarFillIcon, StarMedalIcon, StarNoneIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { ExpertProfileDetailBody } from '@/components/expert/ExpertProfileDetailBody'
import { useCreateDiagnosisRequest } from '@/hooks/useCreateDiagnosisRequest'
import { useExpertProfile } from '@/hooks/useExpertProfile'
import { useFavoriteExpert } from '@/hooks/useFavoriteExpert'
import { useScreenInsets } from '@/hooks/useScreenInsets'
import { RootStackParamList } from '@/navigation/RootNavigator'

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CustomerMasterDetail'>
type RouteProp = { key: string; name: 'CustomerMasterDetail'; params: { expertProfileId: number } }

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

const BOTTOM_BAR_HEIGHT = 90

export function CustomerMasterDetailScreen() {
  const navigation = useNavigation<NavProp>()
  const route = useRoute<RouteProp>()
  const insets = useScreenInsets()

  const { expertProfileId } = route.params
  const { data: profile, isLoading } = useExpertProfile(expertProfileId)
  const { isFavorited, toggle: toggleFavorite, isToggling } = useFavoriteExpert(expertProfileId)
  const { mutate: createDiagnosis, isPending: isDiagnosing } = useCreateDiagnosisRequest()

  const handleDiagnosisRequest = () => {
    Alert.alert('진단요청', `${profile?.centerName ?? '이 명인'}에게 진단을 요청하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '요청하기',
        onPress: () => {
          createDiagnosis(expertProfileId, {
            onSuccess: () => Alert.alert('완료', '진단 요청이 전송되었습니다.'),
            onError: (err: unknown) => {
              const status = (err as { response?: { status?: number } })?.response?.status
              const msg =
                status === 409
                  ? '이미 접수된 진단 요청이 있습니다.'
                  : '진단 요청에 실패했습니다. 다시 시도해주세요.'
              Alert.alert('오류', msg)
            },
          })
        },
      },
    ])
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#D9D9D9]">
        <Text className="text-[14px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-Medium' }}>
          불러오는 중...
        </Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#D9D9D9]" style={{ paddingTop: insets.top }}>
      {/* 네비게이션 바 */}
      <View className="h-[60px] flex-row items-center justify-between px-4">
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          onPress={() => navigation.goBack()}
        >
          <ArrowBackIcon />
        </Pressable>
        <StarMedalIcon size={44} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + 24 }}
      >
        {/* 명인 이름 */}
        <View className="px-[39px] pb-3">
          <Text
            className="text-[28px] text-[#1F2A43]"
            style={{ fontFamily: 'Pretendard-ExtraBold' }}
          >
            {profile?.centerName ?? '-'}
          </Text>
        </View>

        {/* 프로필 카드 — 이미지부터 학력까지 단일 반투명 카드 */}
        <View
          className="mx-[26px] overflow-hidden rounded-[16px] px-[13px] pb-6"
          style={Platform.select({
            ios: {
              backgroundColor: 'rgba(255,255,255,0.3)',
              shadowColor: '#424A56',
              shadowOffset: { width: 2, height: 4 },
              shadowOpacity: 0.31,
              shadowRadius: 18.1,
            },
            android: {
              backgroundColor: 'rgba(255,255,255,0.5)',
              elevation: 8,
            },
          })}
        >
          <ExpertProfileDetailBody
            profile={profile}
            onPressReview={() => navigation.navigate('MasterReview', { expertProfileId })}
          />
        </View>

        {/* 하단 인증 문구 (카드 밖) */}
        <Text
          className="mt-6 text-center text-[12px] text-[#A2A2A2]"
          style={{ fontFamily: 'Pretendard-Medium' }}
        >
          본 명인은 증명서를 통해 운동명인에서 검증한 명인입니다
        </Text>
      </ScrollView>

      {/* 고정 하단 바: 찜 + 진단요청 */}
      <View
        className="absolute bottom-0 left-0 right-0 flex-row items-center bg-[#F2F2F2] px-8"
        style={{
          paddingBottom: insets.bottom + 8,
          paddingTop: 16,
          ...Platform.select({
            ios: {
              shadowColor: '#8B8B8B',
              shadowOffset: { width: 0, height: -1 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
            },
            android: { elevation: 8 },
          }),
        }}
      >
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isFavorited ? '찜 해제' : '찜하기'}
          onPress={() => toggleFavorite()}
          disabled={isToggling}
        >
          {isFavorited ? <StarFillIcon size={60} /> : <StarNoneIcon size={60} />}
        </Pressable>

        <Pressable
          hitSlop={8}
          className="ml-4 h-[52px] flex-1 items-center justify-center rounded-[8px] bg-[#C6A75E]"
          accessibilityRole="button"
          accessibilityLabel="진단요청하기"
          onPress={handleDiagnosisRequest}
          disabled={isDiagnosing}
        >
          <Text
            className="text-[20px] text-[#F2F2F2]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            {isDiagnosing ? '요청 중...' : '진단요청하기'}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
