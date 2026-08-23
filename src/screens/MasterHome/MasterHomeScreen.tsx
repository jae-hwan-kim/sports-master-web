import masterBg from '../../assets/icons/master-background.png'

import { LinearGradient } from 'expo-linear-gradient'
import { Alert, FlatList, ImageBackground, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ArrowNextIcon, LinkIcon, SettingsIcon, StarMedalIcon } from '@/assets/icons'
import { useRootNavigation } from '@/hooks/useRootNavigation'

type DiagnosisItem = {
  id: string
  code: string
  region: string
  age: string
  date: string
}

// TODO: GET /home/diagnosis-requests/preview API 연동 후 교체
const DUMMY_DIAGNOSIS: DiagnosisItem[] = [
  { id: '1', code: '#NNNNNNNN', region: '지역명', age: '최대글자11자', date: 'YYYY. MM. DD' },
  { id: '2', code: '#NNNNNNNN', region: '지역명', age: '최대글자11자', date: 'YYYY. MM. DD' },
  { id: '3', code: '#NNNNNNNN', region: '지역명', age: '최대글자11자', date: 'YYYY. MM. DD' },
]

function MasterModeBadge() {
  return (
    <View
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
    </View>
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

export function MasterHomeScreen() {
  const insets = useSafeAreaInsets()
  const rootNav = useRootNavigation()

  const handleReviewLink = () => {
    Alert.alert('링크 복사', 'naver.com 링크가 복사되었습니다.')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#1E2A3A' }}>
      {/* 상단 배경 사진 영역 */}
      <ImageBackground
        source={masterBg}
        resizeMode="cover"
        style={{ paddingTop: insets.top }}
      >
        {/* 전체 dark 오버레이 — 배경 이미지 흐릿하게 */}
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
          <MasterModeBadge />
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

          <View style={{ flex: 1, paddingLeft: 16, paddingTop: 18, justifyContent: 'space-between', paddingBottom: 16 }}>
            <View>
              <Text style={{ color: '#F2F2F2', fontSize: 18, fontFamily: 'Pretendard-ExtraBold' }}>
                명인 등급
              </Text>
              <Text
                style={{ color: '#D9D9D9', fontSize: 13, fontFamily: 'Pretendard-Medium', marginTop: 7 }}
              >
                현재 명인 등급{' '}
                <Text style={{ color: '#FBBC05' }}>스타메달</Text>
                {' '}입니다
              </Text>
            </View>

            {/* 통계 — alignSelf: flex-start로 row가 늘어나지 않게 고정 */}
            <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' }}>
              <StatBox value="999+" label="리뷰" />
              <StatDivider />
              <StatBox value="4.8" label="평점" />
              <StatDivider />
              <StatBox value="1%" label="상위" />
            </View>
          </View>
        </View>
      </ImageBackground>

      {/* 하단 진단요청 고객 섹션 — marginTop: -16으로 ImageBackground와 겹쳐 radius가 보이게 */}
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
          paddingHorizontal: 32,
        }}
      >
        {/* 섹션 헤더 */}
        <Pressable
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}
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
          data={DUMMY_DIAGNOSIS}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item }) => (
            <View
              style={{
                height: 82,
                borderRadius: 8,
                backgroundColor: '#EFEFEF',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
              }}
            >
              <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#B0B0B0' }} />
              <View style={{ flex: 1, marginLeft: 19 }}>
                <Text style={{ color: '#B48247', fontSize: 13, fontFamily: 'Pretendard-Medium' }}>
                  {item.code}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                  <Text style={{ color: '#74768E', fontSize: 13, fontFamily: 'Pretendard-Medium' }}>
                    {item.region} {item.age}
                  </Text>
                  <Text style={{ color: '#74768E', fontSize: 12, fontFamily: 'Pretendard-Regular' }}>
                    {item.date}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListFooterComponent={
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
          }
        />
      </View>
    </View>
  )
}
