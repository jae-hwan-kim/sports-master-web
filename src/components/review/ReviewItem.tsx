import { Image } from 'expo-image'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useState } from 'react'

import { Checkbox } from '@/components/Checkbox'
import { StarRating } from '@/components/StarRating'

export type ReviewData = {
  id: number
  nickname: string
  avatarUri?: string
  rating: number
  date: string // e.g. '2026.09.01'
  content: string
  photoUris?: string[]
}

type Props = {
  review: ReviewData
  isDeleteMode: boolean
  selected: boolean
  onSelectChange: (selected: boolean) => void
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <Text className={filled ? 'text-primary' : 'text-gray1'} style={{ fontSize: 12 }}>
      ★
    </Text>
  )
}

const COLLAPSED_LINES = 3

export function ReviewItem({ review, isDeleteMode, selected, onSelectChange }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { nickname, avatarUri, rating, date, content, photoUris } = review

  return (
    <View className="py-4">
      {/* Top row: avatar / nickname + rating / date / checkbox */}
      <View className="flex-row items-start">
        {/* Avatar */}
        <View
          className="rounded-full bg-gray1 overflow-hidden"
          style={{ width: 36, height: 36 }}
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={{ width: 36, height: 36 }} contentFit="cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-gray2" style={{ fontSize: 16 }}>👤</Text>
            </View>
          )}
        </View>

        {/* Nickname + rating + date */}
        <View className="ml-2 flex-1">
          <Text
            className="text-gray2 text-small2"
            style={{ fontFamily: 'Pretendard-SemiBold' }}
          >
            {nickname}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <StarRating value={rating} size={12} renderStar={StarIcon} />
            <Text
              className="text-gray2 text-small2"
              style={{ fontFamily: 'Pretendard-SemiBold' }}
            >
              {date}
            </Text>
          </View>
        </View>

        {/* Checkbox in delete mode */}
        {isDeleteMode && (
          <Pressable
            hitSlop={8}
            onPress={() => onSelectChange(!selected)}
            className="items-center justify-center"
            style={{ width: 44, height: 44 }}
          >
            <View
              className={`rounded border items-center justify-center ${
                selected ? 'border-primary bg-primary' : 'border-gray3 bg-transparent'
              }`}
              style={{ width: 18, height: 18 }}
            >
              {selected && (
                <Text className="text-white" style={{ fontSize: 11 }}>
                  ✓
                </Text>
              )}
            </View>
          </Pressable>
        )}
      </View>

      {/* Photo thumbnails */}
      {photoUris && photoUris.length > 0 && (
        <FlatList
          data={photoUris}
          keyExtractor={(uri, i) => `${uri}-${i}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 4, paddingTop: 8 }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={{ width: 40, height: 40, borderRadius: 4 }}
              contentFit="cover"
            />
          )}
        />
      )}

      {/* Review text */}
      <View className="mt-2 pr-9">
        <Text
          className="text-gray3 text-small2"
          style={{ fontFamily: 'Pretendard-Medium', lineHeight: 20 }}
          numberOfLines={expanded ? undefined : COLLAPSED_LINES}
        >
          {content}
        </Text>
      </View>

      {/* Expand/collapse toggle */}
      <Pressable
        hitSlop={8}
        onPress={() => setExpanded((prev) => !prev)}
        className="absolute bottom-4 right-0 items-center justify-center"
        style={{ width: 20, height: 20 }}
      >
        <Text className="text-gray2" style={{ fontSize: 12 }}>
          {expanded ? '∧' : '∨'}
        </Text>
      </Pressable>
    </View>
  )
}
