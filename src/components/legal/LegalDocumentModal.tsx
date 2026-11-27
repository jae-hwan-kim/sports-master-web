import { useCallback, useMemo, useRef } from 'react'
import { FlatList, type ListRenderItem, Modal, Platform, Pressable, View } from 'react-native'

import CloseSvg from '@/assets/icons/close-legal.svg'
import { Text } from '@/components/AppText'
import {
  LEGAL_DOCUMENTS,
  type LegalBlock,
  type LegalDocumentType,
} from '@/components/legal/legalDocuments'
import { useScreenInsets } from '@/hooks/useScreenInsets'

type Props = {
  // null이면 닫힘
  type: LegalDocumentType | null
  onClose: () => void
}

// 블록을 한 줄 단위 행으로 펼친다 — 목록 항목도 각각 한 행
type Row = {
  key: string
  kind: 'bold' | 'text' | 'item'
  text: string
  marker?: string // 목록 기호: • 또는 1.
  gapTop: boolean // 앞 블록과의 빈 줄 간격
}

// Android 는 한글 어절 단위 줄바꿈 옵션이 없어 글자마다 줄이 끊긴다.
// 어절 안의 글자 사이에 WORD JOINER(U+2060, 폭 0)를 넣어 띄어쓰기에서만 줄바꿈되게 한다.
// iOS 는 lineBreakStrategyIOS="hangul-word" 로 처리
const WORD_JOINER = '⁠'
const keepWords = (text: string) =>
  Platform.OS === 'android'
    ? text
        .split(' ')
        .map((word) => Array.from(word).join(WORD_JOINER))
        .join(' ')
    : text

function toRows(blocks: LegalBlock[]): Row[] {
  const rows: Row[] = []
  blocks.forEach((block, b) => {
    const gapTop = b > 0
    if (block.type === 'heading' || block.type === 'paragraph') {
      rows.push({
        key: `${b}`,
        kind: block.type === 'heading' ? 'bold' : 'text',
        text: keepWords(block.text),
        gapTop,
      })
      return
    }
    block.items.forEach((item, i) => {
      rows.push({
        key: `${b}-${i}`,
        kind: 'item',
        text: keepWords(item),
        marker: block.type === 'numbered' ? `${i + 1}.` : '•',
        gapTop: gapTop && i === 0,
      })
    })
  })
  return rows
}

// Figma 2663:9958 개인정보처리방침 / 2663:10041 이용약관
// overlay rgba(7,9,28,0.6) · 패널 좌31/우32 · bg #F2F2F2 · radius 16 · shadow/구분선 없음
// 닫기 45×45 우상단 고정 · 본문 상단 57 / 좌 34 / 우 32 · 16px, lineHeight 1.2(19px), 빈 줄 19px
const TEXT = 'text-[16px] leading-[19px]'
// iOS: 한글을 글자 단위가 아닌 어절(띄어쓰기) 단위로 줄바꿈. Android 는 무시됨
const HANGUL_WORD = 'hangul-word'

export function LegalDocumentModal({ type, onClose }: Props) {
  const insets = useScreenInsets()
  // 닫힘 fade-out 동안 내용이 비지 않도록 마지막 문서 유지
  const lastTypeRef = useRef<LegalDocumentType>('privacy')
  if (type !== null) lastTypeRef.current = type
  const document = LEGAL_DOCUMENTS[lastTypeRef.current]
  const rows = useMemo(() => toRows(document.blocks), [document])

  const renderItem: ListRenderItem<Row> = useCallback(({ item }) => {
    const gap = item.gapTop ? 'mt-[19px]' : ''
    if (item.kind === 'bold') {
      return (
        <Text
          accessibilityRole="header"
          lineBreakStrategyIOS={HANGUL_WORD}
          className={`${gap} ${TEXT} font-pretendard-extrabold text-black`}
        >
          {item.text}
        </Text>
      )
    }
    if (item.kind === 'text') {
      return (
        <Text
          lineBreakStrategyIOS={HANGUL_WORD}
          className={`${gap} ${TEXT} font-pretendard-medium text-gray3`}
        >
          {item.text}
        </Text>
      )
    }
    return (
      <View className={`${gap} flex-row`}>
        <Text className={`${TEXT} w-[24px] text-center font-pretendard-medium text-gray3`}>
          {item.marker}
        </Text>
        <Text
          lineBreakStrategyIOS={HANGUL_WORD}
          className={`${TEXT} flex-1 font-pretendard-medium text-gray3`}
        >
          {item.text}
        </Text>
      </View>
    )
  }, [])

  return (
    <Modal
      visible={type !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* insets는 런타임 값이라 style로 최소 사용 */}
      <View
        className="flex-1 bg-[rgba(7,9,28,0.6)] pl-[31px] pr-[32px]"
        style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }}
      >
        <View className="flex-1 overflow-hidden rounded-[16px] bg-white">
          <FlatList
            data={rows}
            keyExtractor={(row) => row.key}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-[40px] pl-[34px] pr-[32px] pt-[57px]"
          />

          {/* 닫기 — 스크롤과 무관하게 우상단 고정 */}
          <Pressable
            onPress={onClose}
            className="absolute right-0 top-0"
            accessibilityRole="button"
            accessibilityLabel={`${document.title} 닫기`}
          >
            <CloseSvg width={45} height={45} />
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}
