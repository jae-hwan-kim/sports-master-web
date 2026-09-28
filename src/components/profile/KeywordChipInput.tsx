import { FlatList, Pressable, Text } from 'react-native'
import { useCallback } from 'react'

type Props = {
  keywords: string[]
  onChange: (keywords: string[]) => void
}

const PRESET_KEYWORDS = [
  '컨디셔닝', '재활운동', '체형교정', '기능성운동', '선수트레이닝',
  '아동발달', '방문재활', '1:1 지도', '필라테스', '특수치료',
  '체형분석', '식단관리', '시니어운동', '수술재활', '원장직강',
]

export function KeywordChipInput({ keywords, onChange }: Props) {
  const toggle = useCallback(
    (keyword: string) => {
      if (keywords.includes(keyword)) {
        onChange(keywords.filter((k) => k !== keyword))
      } else if (keywords.length < 3) {
        onChange([...keywords, keyword])
      }
    },
    [keywords, onChange]
  )

  const renderItem = useCallback(
    ({ item }: { item: string }) => {
      const selected = keywords.includes(item)
      return (
        <Pressable
          hitSlop={4}
          onPress={() => toggle(item)}
          className={`m-1 flex-1 h-[34px] items-center justify-center rounded-[82px] border px-2 ${
            selected
              ? 'bg-[#1F2A43] border-[#1F2A43]'
              : 'bg-[#F2F2F2] border-[#74768E]'
          }`}
          accessibilityRole="button"
          accessibilityLabel={item}
        >
          <Text
            className={`text-[13px] ${selected ? 'text-[#F2F2F2]' : 'text-[#07091C]'}`}
            style={{ fontFamily: 'Pretendard-Medium' }}
            numberOfLines={1}
          >
            {item}
          </Text>
        </Pressable>
      )
    },
    [keywords, toggle]
  )

  return (
    <FlatList
      data={PRESET_KEYWORDS}
      keyExtractor={(item) => item}
      numColumns={3}
      scrollEnabled={false}
      renderItem={renderItem}
    />
  )
}
