import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { HomeTabIcon, ProfileTabIcon, SearchTabIcon } from '@/assets/icons'
import { CustomerExploreScreen } from '@/screens/CustomerExplore/CustomerExploreScreen'
import { CustomerHomeScreen } from '@/screens/CustomerHome/CustomerHomeScreen'
import { CustomerProfileScreen } from '@/screens/CustomerProfile/CustomerProfileScreen'

export type CustomerTabParamList = {
  CustomerHomeTab: undefined
  CustomerExploreTab: undefined
  CustomerProfileTab: undefined
}

const Tab = createBottomTabNavigator<CustomerTabParamList>()

const TAB_ICONS = {
  CustomerHomeTab: HomeTabIcon,
  CustomerExploreTab: SearchTabIcon,
  CustomerProfileTab: ProfileTabIcon,
} as const

const TAB_LABELS: Record<keyof CustomerTabParamList, string> = {
  CustomerHomeTab: '홈',
  CustomerExploreTab: '명인탐색',
  CustomerProfileTab: '프로필',
}

const ACTIVE_COLOR = '#1F2A43'
const INACTIVE_COLOR = '#A2A2A2'

function CustomTabBar({
  state,
  descriptors: _descriptors,
  navigation,
}: Parameters<NonNullable<React.ComponentProps<typeof Tab.Navigator>['tabBar']>>[0]) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="flex-row items-center border-t border-gray1 bg-white"
      style={{ paddingBottom: insets.bottom, height: 56 + insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index
        const routeName = route.name as keyof CustomerTabParamList
        const Icon = TAB_ICONS[routeName]
        const label = TAB_LABELS[routeName]
        const iconColor = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        return (
          <Pressable
            key={route.key}
            hitSlop={8}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: isFocused }}
            accessibilityLabel={label}
            className="flex-1 items-center justify-center gap-0.5"
          >
            <Icon size={44} color={iconColor} />
            <Text style={{ color: iconColor }} className="text-[12px] font-semibold">
              {label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export function CustomerTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="CustomerHomeTab" component={CustomerHomeScreen} />
      <Tab.Screen name="CustomerExploreTab" component={CustomerExploreScreen} />
      <Tab.Screen name="CustomerProfileTab" component={CustomerProfileScreen} />
    </Tab.Navigator>
  )
}
