import { Pressable, View } from 'react-native'
import { scale } from 'react-native-size-matters'

type StarIconProps = {
  size: number
  filled: boolean
}

type StarRatingProps = {
  value: number
  max?: number
  onChange?: (value: number) => void
  size?: number
  renderStar: (props: StarIconProps) => React.ReactNode
}

// renderStar로 아이콘을 주입받는다 — star-fill/star-none.svg가 아직 없어도 깨지지 않도록 함
export function StarRating({ value, max = 5, onChange, size = 24, renderStar }: StarRatingProps) {
  const stars = Array.from({ length: max }, (_, index) => index + 1)

  return (
    <View className="flex-row items-center" style={{ gap: scale(4) }}>
      {stars.map((star) => {
        const filled = star <= value
        const content = renderStar({ size, filled })

        if (!onChange) {
          return <View key={star}>{content}</View>
        }

        return (
          <Pressable key={star} hitSlop={8} onPress={() => onChange(star)}>
            {content}
          </Pressable>
        )
      })}
    </View>
  )
}
