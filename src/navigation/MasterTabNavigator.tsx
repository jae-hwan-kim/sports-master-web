import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { DiagnosisTabIcon, HomeTabIcon, ProfileTabIcon } from '@/assets/icons'
import { Text } from '@/components/AppText'
import { MasterProfileStackNavigator } from '@/navigation/MasterProfileStackNavigator'
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

const TAB_CONTENT_HEIGHT = 59

function CustomTabBar({
  state,
  descriptors: _descriptors,
  navigation,
}: Parameters<NonNullable<React.ComponentProps<typeof Tab.Navigator>['tabBar']>>[0]) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="flex-row items-start border-t border-gray1 bg-[#F2F2F2]"
      // Figma: 탭 콘텐츠 영역 59 (아이콘 44 + 라벨 14, 상단 정렬) + 시스템 하단 inset
      style={{ paddingBottom: insets.bottom, minHeight: TAB_CONTENT_HEIGHT + insets.bottom }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index
        const routeName = route.name as keyof MasterTabParamList
        const Icon = TAB_ICONS[routeName]
        const label = TAB_LABELS[routeName]
        const iconColor = isFocused ? '#1F2A43' : '#D9D9D9'

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

export function MasterTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="HomeTab" component={MasterHomeScreen} />
      <Tab.Screen name="DiagnosisTab" component={MasterDiagnosisScreen} />
      <Tab.Screen name="ProfileTab" component={MasterProfileStackNavigator} />
    </Tab.Navigator>
  )
}
