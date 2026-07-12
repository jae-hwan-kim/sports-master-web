import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { LoginScreen } from '@/screens/Login/LoginScreen'
import { OnboardingScreen } from '@/screens/Onboarding/OnboardingScreen'
import { SignUpScreen } from '@/screens/SignUp/SignUpScreen'

export type RootStackParamList = {
  Onboarding: undefined
  Login: undefined
  SignUp: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  )
}
