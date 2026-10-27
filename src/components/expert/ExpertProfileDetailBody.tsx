import { useState } from 'react'
import { FlatList, Linking, Platform, Pressable, Share, View } from 'react-native'

import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

import { StarMedalIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { ImageViewerModal } from '@/components/expert/ImageViewerModal'
import type { components } from '@/types/schema'
import { formatPhone } from '@/utils/phone'

type ExpertProfileResponseDto = components['schemas']['ExpertProfileResponseDto']

function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="mb-3 text-[16px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-SemiBold' }}>
      {label}
    </Text>
  )
}

function ReadonlyBox({ children }: { children: React.ReactNode }) {
  return <View className="rounded-[4px] bg-[#F2F2F2] px-[13px] py-[15px]">{children}</View>
}

function PdfRow({ url }: { url: string }) {
  const filename = url.split('/').pop() ?? url
  return (
    <ReadonlyBox>
      <View className="flex-row items-center justify-between">
        <Text
          className="mr-3 flex-1 text-[13px] text-[#1F2A43]"
          style={{ fontFamily: 'Pretendard-Medium' }}
          numberOfLines={1}
        >
          {filename}
        </Text>
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="파일열기"
          onPress={() => sharePdf(url)}
          className="h-[24px] w-[60px] items-center justify-center rounded-[4px] bg-[#C6A75E]"
        >
          <Text
            className="text-[12px] text-[#F2F2F2]"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            파일열기
          </Text>
        </Pressable>
      </View>
    </ReadonlyBox>
  )
}

// Figma: 파일열기 → 시스템 공유 시트(Activity View). Android Share는 url 필드 미지원 → message로 전달
function sharePdf(url: string) {
  Share.share(Platform.OS === 'ios' ? { url } : { message: url }).catch(() => {})
}

// 명인 상세 본문 — 상세 화면(CustomerMasterDetail)과 이달의 소개 명인 모달에서 공용
export function ExpertProfileDetailBody({
  profile,
  onPressReview,
}: {
  profile: ExpertProfileResponseDto | undefined
  onPressReview: () => void
}) {
  const [viewerUri, setViewerUri] = useState<string | null>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const centerUrl = profile?.kakaoOpenChatUrl
  const careerItems = profile?.careerText ? profile.careerText.split('\n').filter(Boolean) : []
  const reviewCount =
    (profile?.totalReviewCount ?? 0) > 999 ? '999+' : String(profile?.totalReviewCount ?? 0)

  return (
    <>
      {/* 프로필 이미지 */}
      <View className="mt-[11px] h-[470px] overflow-hidden rounded-[12px]">
        {profile?.profileImageUrl ? (
          <Image
            source={{ uri: profile.profileImageUrl }}
            style={{ width: '100%', height: 470 }}
            contentFit="cover"
          />
        ) : (
          <View className="flex-1 bg-[#D9D9D9]" />
        )}

        {/* 훈장 아이콘 */}
        <View className="absolute right-0 top-0">
          <StarMedalIcon size={58} />
        </View>

        {/* 키워드 칩 (이미지 위, 소개글 상단) */}
        <View className="absolute bottom-[139px] left-[24px] flex-row gap-2">
          <FlatList
            horizontal
            scrollEnabled={false}
            data={profile?.keywordTags?.slice(0, 3) ?? []}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View className="mr-2 h-[20px] items-center justify-center rounded-full bg-[#1F2A43] px-[13px]">
                <Text
                  className="text-[10px] text-[#F2F2F2]"
                  style={{ fontFamily: 'Pretendard-Medium' }}
                >
                  {item}
                </Text>
              </View>
            )}
          />
        </View>

        {/* 하단 그라디언트 오버레이 */}
        {/* Figma: #F2F2F2 0%→67%(16%)→100%(59%), 레이어 opacity 0.9 */}
        <LinearGradient
          colors={['rgba(242,242,242,0)', 'rgba(242,242,242,0.6)', 'rgba(242,242,242,0.9)']}
          locations={[0, 0.16, 0.59]}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220 }}
        />

        {/* 소개글 + 통계 오버레이 (그라디언트 위) */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 24,
            paddingBottom: 16,
          }}
        >
          <Text className="text-[12px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-Medium' }}>
            {profile?.introduction ?? ''}
          </Text>
          <View className="flex-row items-center justify-around py-4">
            <Pressable
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="리뷰 보기"
              className="flex-1 items-center gap-2"
              onPress={onPressReview}
            >
              <Text
                className="text-[18px] text-[#1F2A43]"
                style={{ fontFamily: 'Pretendard-ExtraBold' }}
              >
                {reviewCount}
              </Text>
              <Text
                className="text-[12px] text-[#1F2A43]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                리뷰
              </Text>
            </Pressable>
            <View className="h-[38px] w-[1px] bg-[#D9D9D9]" />
            <View className="flex-1 items-center gap-2">
              <Text
                className="text-[18px] text-[#1F2A43]"
                style={{ fontFamily: 'Pretendard-ExtraBold' }}
              >
                {profile?.averageRating ?? 0}
              </Text>
              <Text
                className="text-[12px] text-[#1F2A43]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                평점
              </Text>
            </View>
            <View className="h-[38px] w-[1px] bg-[#D9D9D9]" />
            <View className="flex-1 items-center gap-2">
              <Text
                className="text-[18px] text-[#1F2A43]"
                style={{ fontFamily: 'Pretendard-ExtraBold' }}
              >
                {profile?.topPercentile ?? 0}%
              </Text>
              <Text
                className="text-[12px] text-[#1F2A43]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                상위
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 센터정보 */}
      <View className="mt-6">
        <SectionLabel label="센터정보" />
        <Pressable
          hitSlop={8}
          accessibilityRole="link"
          accessibilityLabel="센터정보 링크 열기"
          disabled={!centerUrl}
          onPress={() => setShowLinkDialog(true)}
        >
          <ReadonlyBox>
            <Text
              className="text-[13px] text-[#1F2A43]"
              style={{ fontFamily: 'Pretendard-Medium' }}
              numberOfLines={1}
            >
              {centerUrl ?? '-'}
            </Text>
          </ReadonlyBox>
        </Pressable>
      </View>

      {/* 센터연락처 */}
      <View className="mt-6">
        <SectionLabel label="센터연락처" />
        <ReadonlyBox>
          <Text className="text-[12px] text-[#1F2A43]" style={{ fontFamily: 'Pretendard-Medium' }}>
            {profile?.centerPhone ? formatPhone(profile.centerPhone) : '-'}
          </Text>
        </ReadonlyBox>
      </View>

      {/* 키워드 */}
      <View className="mt-6">
        <SectionLabel label="키워드" />
        <FlatList
          horizontal
          scrollEnabled={false}
          data={profile?.keywordTags ?? []}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <View className="mr-2 h-[24px] items-center justify-center rounded-full border border-[#74768E] bg-[#1F2A43] px-4">
              <Text
                className="text-[13px] text-[#F2F2F2]"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                {item}
              </Text>
            </View>
          )}
        />
      </View>

      {/* 이미지 */}
      {(profile?.portfolioImageUrls?.length ?? 0) > 0 && (
        <View className="mt-6">
          <SectionLabel label="이미지" />
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={profile?.portfolioImageUrls ?? []}
            keyExtractor={(item, idx) => `${item}_${idx}`}
            renderItem={({ item }) => (
              <Pressable
                hitSlop={4}
                accessibilityRole="imagebutton"
                accessibilityLabel="이미지 크게보기"
                onPress={() => setViewerUri(item)}
              >
                <Image
                  source={{ uri: item }}
                  style={{ width: 80, height: 80, borderRadius: 4, marginRight: 8 }}
                  contentFit="cover"
                />
              </Pressable>
            )}
          />
        </View>
      )}

      {/* 포트폴리오 */}
      {!!profile?.educationPdfUrl && (
        <View className="mt-6">
          <SectionLabel label="포트폴리오" />
          <PdfRow url={profile.educationPdfUrl} />
        </View>
      )}

      {/* 학력 및 경력사항 */}
      {careerItems.length > 0 && (
        <View className="mt-6">
          <SectionLabel label="학력 및 경력사항" />
          <View className="gap-1 rounded-[4px] bg-[#F2F2F2] px-[13px] py-[15px]">
            <FlatList
              scrollEnabled={false}
              data={careerItems}
              keyExtractor={(item, idx) => `career_${idx}`}
              renderItem={({ item }) => (
                <Text
                  className="text-[13px] text-[#1F2A43]"
                  style={{ fontFamily: 'Pretendard-Medium', lineHeight: 20 }}
                >
                  • {item}
                </Text>
              )}
            />
          </View>
        </View>
      )}

      <ImageViewerModal uri={viewerUri} onClose={() => setViewerUri(null)} />

      {/* Figma: 센터URL이동 */}
      <ConfirmDialog
        visible={showLinkDialog}
        title="외부 링크이동"
        description="명인의 개인 링크로 이동할까요?"
        confirmLabel="이동하기"
        onConfirm={() => {
          setShowLinkDialog(false)
          if (centerUrl) Linking.openURL(centerUrl).catch(() => {})
        }}
        onCancel={() => setShowLinkDialog(false)}
      />
    </>
  )
}
