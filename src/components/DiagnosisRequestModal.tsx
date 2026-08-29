import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native'

import type { DiagnosisIncomingItem } from '@/api/diagnosis'
import { formatDateTime } from '@/utils/date'

type Props = {
  item: DiagnosisIncomingItem | null
  onClose: () => void
}

function genderLabel(gender: string | null): string | null {
  if (!gender) return null
  return gender === 'male' ? '남성' : gender === 'female' ? '여성' : '기타'
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max) + '…' : s
}

// 다크 칩 — Figma: bg #1F2A43, border #74768E, text #F2F2F2, h:26, borderRadius:82, px:12
function DarkChip({ label }: { label: string }) {
  return (
    <View
      style={{
        height: 26,
        borderRadius: 82,
        backgroundColor: '#1F2A43',
        borderWidth: 1,
        borderColor: '#74768E',
        paddingHorizontal: 12,
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#F2F2F2', fontSize: 13, fontFamily: 'Pretendard-Medium' }}>
        {label}
      </Text>
    </View>
  )
}

export function DiagnosisRequestModal({ item, onClose }: Props) {
  return (
    <Modal
      visible={item !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 반투명 오버레이 — Figma: rgba(7,9,28,0.6) */}
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(7,9,28,0.6)', justifyContent: 'center', alignItems: 'center' }}
        onPress={onClose}
      >
        <Pressable onPress={() => {}} style={{ width: 340 }}>
          {item && <DialogCard item={item} onClose={onClose} />}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function DialogCard({ item, onClose }: { item: DiagnosisIncomingItem; onClose: () => void }) {
  const { customerProfile, createdAt } = item

  const chips: string[] = []
  const ageGender = [
    customerProfile.age != null ? `${customerProfile.age}세` : null,
    genderLabel(customerProfile.gender),
  ].filter(Boolean).join('/')
  if (ageGender) chips.push(ageGender)
  if (customerProfile.region) chips.push(truncate(customerProfile.region, 6))
  if (customerProfile.sport) chips.push(customerProfile.sport)
  if (customerProfile.keywordTags) chips.push(...customerProfile.keywordTags)

  return (
    // 카드 — Figma: drop-shadow 0 0 6.35px rgba(0,0,0,0.1), w:340, borderRadius 없음 (Union으로 처리)
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingTop: 44,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 12.7,
        elevation: 8,
      }}
    >
      {/* 프로필 이미지 — Figma: left:140, size:60, top:-25, borderRadius:30 */}
      <View style={{ position: 'absolute', top: -25, left: 0, right: 0, alignItems: 'center' }}>
        {customerProfile.profileImageUrl ? (
          <Image
            source={{ uri: customerProfile.profileImageUrl }}
            style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 5, borderColor: '#FFFFFF' }}
          />
        ) : (
          <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#D9D9D9', borderWidth: 5, borderColor: '#FFFFFF' }} />
        )}
      </View>

      {/* 닫기 버튼 — Figma: left:286, size:44, top:13 → right = 340-286-44 = 10 */}
      <Pressable
        hitSlop={8}
        onPress={onClose}
        style={{ position: 'absolute', top: 13, right: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      >
        <Text style={{ fontSize: 18, color: '#74768E', fontFamily: 'Pretendard-Medium' }}>✕</Text>
      </Pressable>

      {/*
        ScrollView paddingHorizontal: 20 (personalCode, nickname center 기준)
        chips: marginHorizontal:23 추가 → left=43 (Figma 일치)
        소개글: marginHorizontal:12 추가 → left=32 (Figma 일치)
      */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {/* personalCode — Figma: top:43, h:28, center, #B48247, 16px Medium */}
        <Text style={{ textAlign: 'center', color: '#B48247', fontSize: 16, fontFamily: 'Pretendard-Medium', marginBottom: 4 }}>
          #{customerProfile.personalCode}
        </Text>

        {/* 닉네임 — Figma: top:75, h:28, center, #07091C, 18px ExtraBold */}
        <Text style={{ textAlign: 'center', color: '#07091C', fontSize: 18, fontFamily: 'Pretendard-ExtraBold', marginBottom: 16 }}>
          {customerProfile.nickname ?? customerProfile.name}
        </Text>

        {/* chips — Figma: top:117(1행), top:153(2행), left:43 → marginHorizontal:23 */}
        {chips.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8, marginHorizontal: 23 }}>
            {chips.map((chip, i) => (
              <DarkChip key={i} label={chip} />
            ))}
          </View>
        )}

        {/* 소개글 — Figma: top:195, left:32, w:276, h:190, bg:#D9D9D9, rounded:8 */}
        {/* 내부 텍스트: left:54(카드 기준) = 32+22 → paddingHorizontal:22, top:210=195+15 → paddingTop:15 */}
        <View
          style={{
            backgroundColor: '#D9D9D9',
            borderRadius: 8,
            height: 190,
            paddingHorizontal: 22,
            paddingTop: 15,
            paddingBottom: 16,
            marginTop: 8,
            marginBottom: 16,
            marginHorizontal: 12,
          }}
        >
          <Text style={{ color: '#1F2A43', fontSize: 12, fontFamily: 'Pretendard-Medium', lineHeight: 18 }}>
            {customerProfile.introduction ?? ''}
          </Text>
        </View>

        {/* 요청일시 — Figma: top:401, 소개글 하단(385)에서 16px */}
        <Text style={{ textAlign: 'center', color: '#74768E', fontSize: 12, fontFamily: 'Pretendard-SemiBold' }}>
          요청일시
        </Text>
        <Text style={{ textAlign: 'center', color: '#B48247', fontSize: 12, fontFamily: 'Pretendard-SemiBold', marginTop: 2 }}>
          {formatDateTime(createdAt)}
        </Text>
      </ScrollView>
    </View>
  )
}
