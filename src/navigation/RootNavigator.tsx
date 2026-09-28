import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { CustomerTabNavigator } from '@/navigation/CustomerTabNavigator'
import { MasterTabNavigator } from '@/navigation/MasterTabNavigator'
import { CustomerSettingsScreen } from '@/screens/CustomerSettings/CustomerSettingsScreen'
import { CustomerWelcomeScreen } from '@/screens/CustomerWelcome/CustomerWelcomeScreen'
import { LoginScreen } from '@/screens/Login/LoginScreen'
import { MasterDetailProfileEditScreen } from '@/screens/MasterDetailProfileEdit/MasterDetailProfileEditScreen'
import { MasterMessageGuideScreen } from '@/screens/MasterMessageGuide/MasterMessageGuideScreen'
import { MasterPhoneChangeScreen } from '@/screens/MasterPhoneChange/MasterPhoneChangeScreen'
import { MasterProfileEditScreen } from '@/screens/MasterProfileEdit/MasterProfileEditScreen'
import { MasterSettingsScreen } from '@/screens/MasterSettings/MasterSettingsScreen'
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
  CustomerSettings: undefined
  MasterSettings: undefined
  MasterProfileEdit: undefined
  MasterDetailProfileEdit: undefined
  MasterMessageGuide: undefined
  MasterPhoneChange: undefined
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
      <Stack.Screen name="MasterHome" component={MasterTabNavigator} />
      <Stack.Screen name="CustomerHome" component={CustomerTabNavigator} />
      <Stack.Screen name="CustomerSettings" component={CustomerSettingsScreen} />
      <Stack.Screen name="MasterSettings" component={MasterSettingsScreen} />
      <Stack.Screen name="MasterProfileEdit" component={MasterProfileEditScreen} />
      <Stack.Screen name="MasterDetailProfileEdit" component={MasterDetailProfileEditScreen} />
      <Stack.Screen name="MasterMessageGuide" component={MasterMessageGuideScreen} />
      <Stack.Screen name="MasterPhoneChange" component={MasterPhoneChangeScreen} />
    </Stack.Navigator>
  )
}
