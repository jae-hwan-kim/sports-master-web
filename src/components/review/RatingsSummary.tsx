import { FlatList, Text, View } from 'react-native'

import { StarRating } from '@/components/StarRating'

type Props = {
  avg: number
  /** 5~1점 순서의 분포 카운트 배열 — index 0 = 5점, index 4 = 1점 */
  distribution: [number, number, number, number, number]
  totalCount: number
}

const STAR_LABELS = ['5점', '4점', '3점', '2점', '1점'] as const
const TRACK_WIDTH = 85.5

// Figma: 별 아이콘 placeholder — renderStar에 간단한 텍스트 별 사용
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <Text
      className={filled ? 'text-primary' : 'text-gray1'}
      style={{ fontSize: 14, lineHeight: 17 }}
    >
      ★
    </Text>
  )
}

export function RatingsSummary({ avg, distribution, totalCount }: Props) {
  const maxCount = Math.max(...distribution, 1)

  return (
    <View
      className="flex-row rounded-lg bg-[#f2f2f2]"
      style={{
        shadowColor: '#B5B5B5',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 12.3,
        elevation: 3,
        height: 120,
      }}
    >
      {/* Left: average score + stars */}
      <View className="w-[153px] items-center justify-center">
        <Text
          className="text-[28px] text-black"
          style={{ fontFamily: 'Pretendard-ExtraBold', lineHeight: 36 }}
        >
          {avg.toFixed(1)}
        </Text>
        <StarRating value={Math.round(avg)} size={14} renderStar={StarIcon} />
      </View>

      {/* Vertical divider */}
      <View className="self-stretch bg-gray1" style={{ width: 1, marginVertical: 12 }} />

      {/* Right: distribution bars */}
      <View className="flex-1 justify-center px-[23px]">
        <FlatList
          data={STAR_LABELS}
          keyExtractor={(item) => item}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 7 }} />}
          renderItem={({ item: label, index: i }) => {
            const count = distribution[i]
            const barWidth = (count / maxCount) * TRACK_WIDTH
            return (
              <View className="flex-row items-center">
                <Text
                  className={`w-7 text-small2 ${i === 0 ? 'text-[#C6A75E]' : 'text-[#A2A2A2]'}`}
                  style={{ fontFamily: 'Pretendard-SemiBold' }}
                >
                  {label}
                </Text>
                {/* Track */}
                <View className="rounded-full bg-gray1" style={{ width: TRACK_WIDTH, height: 4 }}>
                  {/* Fill */}
                  {barWidth > 0 && (
                    <View
                      className="absolute left-0 top-0 h-full rounded-full bg-[#C6A75E]"
                      style={{ width: barWidth }}
                    />
                  )}
                </View>
                <Text
                  className={`ml-[10px] text-small2 ${i === 0 ? 'text-[#1F2A43]' : 'text-[#A2A2A2]'}`}
                  style={{ fontFamily: 'Pretendard-SemiBold', minWidth: 24, textAlign: 'right' }}
                >
                  {count > 999 ? '999+' : String(count)}
                </Text>
              </View>
            )
          }}
        />
      </View>
    </View>
  )
}
