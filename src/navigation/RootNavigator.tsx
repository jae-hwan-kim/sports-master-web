import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { CustomerHomeScreen } from '@/screens/CustomerHome/CustomerHomeScreen'
import { CustomerWelcomeScreen } from '@/screens/CustomerWelcome/CustomerWelcomeScreen'
import { LoginScreen } from '@/screens/Login/LoginScreen'
import { MasterHomeScreen } from '@/screens/MasterHome/MasterHomeScreen'
import { MasterVerificationScreen } from '@/screens/MasterVerification/MasterVerificationScreen'
import { MasterWelcomeScreen } from '@/screens/MasterWelcome/MasterWelcomeScreen'
import { OnboardingScreen } from '@/screens/Onboarding/OnboardingScreen'
import { SignUpScreen } from '@/screens/SignUp/SignUpScreen'
import { SignUpRoleSelectScreen } from '@/screens/SignUpRoleSelect/SignUpRoleSelectScreen'

export type RootStackParamList = {
  Onboarding: undefined
  Login: undefined
  SignUp: undefined
  SignUpRoleSelect: undefined
  MasterVerification: undefined
  CustomerWelcome: undefined
  MasterWelcome: undefined
  MasterHome: undefined
  CustomerHome: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignUpRoleSelect" component={SignUpRoleSelectScreen} />
      <Stack.Screen name="MasterVerification" component={MasterVerificationScreen} />
      <Stack.Screen name="CustomerWelcome" component={CustomerWelcomeScreen} />
      <Stack.Screen name="MasterWelcome" component={MasterWelcomeScreen} />
      <Stack.Screen name="MasterHome" component={MasterHomeScreen} />
      <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
    </Stack.Navigator>
  )
}
