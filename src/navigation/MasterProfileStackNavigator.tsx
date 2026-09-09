import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { MasterDetailProfileScreen } from '@/screens/MasterDetailProfile/MasterDetailProfileScreen'
import { MasterDetailProfileEditScreen } from '@/screens/MasterDetailProfileEdit/MasterDetailProfileEditScreen'
import { MasterProfileScreen } from '@/screens/MasterProfile/MasterProfileScreen'
import { MasterReviewScreen } from '@/screens/MasterReview/MasterReviewScreen'

export type MasterProfileStackParamList = {
  MasterProfile: undefined
  MasterDetailProfile: undefined
  MasterDetailProfileEdit: undefined
  MasterReview: undefined
}

const Stack = createNativeStackNavigator<MasterProfileStackParamList>()

export function MasterProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MasterProfile" component={MasterProfileScreen} />
      <Stack.Screen name="MasterDetailProfile" component={MasterDetailProfileScreen} />
      <Stack.Screen name="MasterDetailProfileEdit" component={MasterDetailProfileEditScreen} />
      <Stack.Screen name="MasterReview" component={MasterReviewScreen} />
    </Stack.Navigator>
  )
}
