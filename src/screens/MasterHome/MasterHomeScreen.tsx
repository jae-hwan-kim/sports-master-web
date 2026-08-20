import { LinearGradient } from 'expo-linear-gradient'
import { ImageBackground, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { SettingsIcon, StarFillIcon, StarNoneIcon } from '@/assets/icons'
import { Button } from '@/components/Button'
import { StarRating } from '@/components/StarRating'
import { useRootNavigation } from '@/hooks/useRootNavigation'

export function MasterHomeScreen() {
  const insets = useSafeAreaInsets()
  const rootNav = useRootNavigation()

  return (
    <ImageBackground
      source={require('../../assets/icons/background.png')}
      resizeMode="cover"
      style={{ flex: 1, width: '100%' }}
    >
      <LinearGradient
        colors={['transparent', 'rgba(7,9,28,0.85)']}
        locations={[0.3, 1]}
        style={{ flex: 1 }}
      >
        {/* 상단 설정 버튼 */}
        <View style={{ paddingTop: insets.top }} className="items-end px-4">
          <Pressable
            hitSlop={8}
            onPress={() => rootNav?.navigate('MasterSettings')}
            accessibilityRole="button"
            accessibilityLabel="설정"
          >
            <SettingsIcon size={44} color="#F2F2F2" />
          </Pressable>
        </View>

        {/* 하단 프로필 카드 */}
        <View className="flex-1 justify-end px-6 pb-8">
          <View className="gap-3">
            <View className="flex-row items-center gap-4">
              <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-gray2" />
              <View className="gap-1">
                <Text className="text-[20px] font-extrabold text-white">홍길동 명인</Text>
                <StarRating
                  value={4.5}
                  size={16}
                  renderStar={({ size, filled }) =>
                    filled ? <StarFillIcon size={size} /> : <StarNoneIcon size={size} />
                  }
                />
              </View>
            </View>
            <Button label="진단 요청 받기" variant="gold" />
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  )
}
