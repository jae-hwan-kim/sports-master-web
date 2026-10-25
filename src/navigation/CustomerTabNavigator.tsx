import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { Pressable, View } from 'react-native'

import { DiagnosisTabIcon, HomeTabIcon, ProfileTabIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { useScreenInsets } from '@/hooks/useScreenInsets'
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
  CustomerExploreTab: DiagnosisTabIcon,
  CustomerProfileTab: ProfileTabIcon,
} as const

const TAB_LABELS: Record<keyof CustomerTabParamList, string> = {
  CustomerHomeTab: '홈',
  CustomerExploreTab: '명인탐색',
  CustomerProfileTab: '프로필',
}

const ACTIVE_COLOR = '#1F2A43'
const INACTIVE_COLOR = '#D9D9D9'

const TAB_CONTENT_HEIGHT = 59

function CustomTabBar({
  state,
  descriptors: _descriptors,
  navigation,
}: Parameters<NonNullable<React.ComponentProps<typeof Tab.Navigator>['tabBar']>>[0]) {
  const insets = useScreenInsets()

  return (
    <View
      className="flex-row items-start bg-white"
      style={{
        paddingBottom: insets.tabBarBottom,
        minHeight: TAB_CONTENT_HEIGHT + insets.tabBarBottom,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
      }}
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
            className="flex-1 items-center"
          >
            <Icon size={44} color={iconColor} />
            <Text style={{ color: iconColor }} className="text-[12px] font-semibold leading-[14px]">
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
