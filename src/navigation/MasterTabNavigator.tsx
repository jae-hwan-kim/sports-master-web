import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { MasterHomeScreen } from '@/screens/MasterHome/MasterHomeScreen'

export type MasterTabParamList = {
  HomeTab: undefined
  SearchTab: undefined
  ActionTab: undefined
  NotifyTab: undefined
  MyPageTab: undefined
}

const Tab = createBottomTabNavigator<MasterTabParamList>()

function PlaceholderScreen() {
  return <View className="flex-1 bg-[#F2F2F2]" />
}

function CustomTabBar({ state, descriptors, navigation }: Parameters<NonNullable<React.ComponentProps<typeof Tab.Navigator>['tabBar']>>[0]) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="flex-row items-center bg-black"
      style={{ paddingBottom: insets.bottom, height: 60 + insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const isFocused = state.index === index
        const isAction = route.name === 'ActionTab'

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        if (isAction) {
          return (
            <View key={route.key} className="flex-1 items-center justify-center">
              <Pressable
                hitSlop={8}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={options.title ?? route.name}
                className="h-[52px] w-[52px] items-center justify-center rounded-full bg-primary"
              />
            </View>
          )
        }

        return (
          <Pressable
            key={route.key}
            hitSlop={8}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={options.title ?? route.name}
            className="flex-1 items-center justify-center"
          >
            <View className={`h-2 w-2 rounded-full ${isFocused ? 'bg-primary' : 'bg-gray2'}`} />
          </Pressable>
        )
      })}
    </View>
  )
}

export function MasterTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="HomeTab" component={MasterHomeScreen} options={{ title: '홈' }} />
      <Tab.Screen name="SearchTab" component={PlaceholderScreen} options={{ title: '검색' }} />
      <Tab.Screen name="ActionTab" component={PlaceholderScreen} options={{ title: '' }} />
      <Tab.Screen name="NotifyTab" component={PlaceholderScreen} options={{ title: '알림' }} />
      <Tab.Screen name="MyPageTab" component={PlaceholderScreen} options={{ title: '마이페이지' }} />
    </Tab.Navigator>
  )
}
