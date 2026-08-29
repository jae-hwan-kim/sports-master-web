import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { DiagnosisTabIcon, HomeTabIcon, ProfileTabIcon } from '@/assets/icons'
import { MasterDiagnosisScreen } from '@/screens/MasterDiagnosis/MasterDiagnosisScreen'
import { MasterHomeScreen } from '@/screens/MasterHome/MasterHomeScreen'

export type MasterTabParamList = {
  HomeTab: undefined
  DiagnosisTab: undefined
  ProfileTab: undefined
}

const Tab = createBottomTabNavigator<MasterTabParamList>()

const TAB_ICONS = {
  HomeTab: HomeTabIcon,
  DiagnosisTab: DiagnosisTabIcon,
  ProfileTab: ProfileTabIcon,
} as const

const TAB_LABELS: Record<keyof MasterTabParamList, string> = {
  HomeTab: '홈',
  DiagnosisTab: '진단요청',
  ProfileTab: '프로필',
}

function PlaceholderScreen() {
  return <View className="flex-1 bg-[#F2F2F2]" />
}

function CustomTabBar({
  state,
  descriptors,
  navigation,
}: Parameters<NonNullable<React.ComponentProps<typeof Tab.Navigator>['tabBar']>>[0]) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="flex-row items-center border-t border-gray1 bg-[#F2F2F2]"
      style={{ paddingBottom: insets.bottom, height: 56 + insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index
        const routeName = route.name as keyof MasterTabParamList
        const Icon = TAB_ICONS[routeName]
        const label = TAB_LABELS[routeName]
        const iconColor = isFocused ? '#1F2A43' : '#D9D9D9'

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
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
            <Text
              style={{ color: iconColor }}
              className="text-[12px] font-semibold"
            >
              {label}
            </Text>
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
      <Tab.Screen name="HomeTab" component={MasterHomeScreen} />
      <Tab.Screen name="DiagnosisTab" component={MasterDiagnosisScreen} />
      <Tab.Screen name="ProfileTab" component={PlaceholderScreen} />
    </Tab.Navigator>
  )
}
