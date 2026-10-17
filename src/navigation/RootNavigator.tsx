import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { CustomerTabNavigator } from '@/navigation/CustomerTabNavigator'
import { MasterTabNavigator } from '@/navigation/MasterTabNavigator'
import { CustomerSettingsScreen } from '@/screens/CustomerSettings/CustomerSettingsScreen'
import { FavoriteExpertsScreen } from '@/screens/FavoriteExperts/FavoriteExpertsScreen'
import { MasterReviewScreen } from '@/screens/MasterReview/MasterReviewScreen'
import { MyReviewEditScreen } from '@/screens/MyReviewEdit/MyReviewEditScreen'
import { MyReviewsScreen } from '@/screens/MyReviews/MyReviewsScreen'
import { ReviewWriteScreen } from '@/screens/ReviewWrite/ReviewWriteScreen'
import { CustomerWelcomeScreen } from '@/screens/CustomerWelcome/CustomerWelcomeScreen'
import { OnboardingQ2GenderAgeScreen } from '@/screens/OnboardingQ2GenderAge/OnboardingQ2GenderAgeScreen'
import { RecommendedMastersScreen } from '@/screens/RecommendedMasters/RecommendedMastersScreen'
import { RegionSelectQ1Screen } from '@/screens/RegionSelectQ1/RegionSelectQ1Screen'
import { SurveyKeywordSelectScreen } from '@/screens/SurveyKeywordSelect/SurveyKeywordSelectScreen'
import { LoginScreen } from '@/screens/Login/LoginScreen'
import { CustomerMasterDetailScreen } from '@/screens/CustomerMasterDetail/CustomerMasterDetailScreen'
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
  CustomerMasterDetail: { expertProfileId: number }
  MasterDetailProfileEdit: undefined
  MasterMessageGuide: undefined
  MasterPhoneChange: undefined
  RegionSelectQ1: undefined
  OnboardingQ2GenderAge: undefined
  SurveyKeywordSelect: undefined
  RecommendedMasters: undefined
  FavoriteExperts: undefined
  MasterReview: { expertProfileId: number }
  MyReviews: undefined
  MyReviewEdit: {
    reviewId: number
    expertName?: string
    initialRating: number
    initialContent?: string
  }
  ReviewWrite: undefined
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
      <Stack.Screen name="CustomerMasterDetail" component={CustomerMasterDetailScreen} />
      <Stack.Screen name="MasterDetailProfileEdit" component={MasterDetailProfileEditScreen} />
      <Stack.Screen name="MasterMessageGuide" component={MasterMessageGuideScreen} />
      <Stack.Screen name="MasterPhoneChange" component={MasterPhoneChangeScreen} />
      <Stack.Screen name="RegionSelectQ1" component={RegionSelectQ1Screen} />
      <Stack.Screen name="OnboardingQ2GenderAge" component={OnboardingQ2GenderAgeScreen} />
      <Stack.Screen name="SurveyKeywordSelect" component={SurveyKeywordSelectScreen} />
      <Stack.Screen name="RecommendedMasters" component={RecommendedMastersScreen} />
      <Stack.Screen name="FavoriteExperts" component={FavoriteExpertsScreen} />
      <Stack.Screen name="MasterReview" component={MasterReviewScreen} />
      <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
      <Stack.Screen name="MyReviewEdit" component={MyReviewEditScreen} />
      <Stack.Screen name="ReviewWrite" component={ReviewWriteScreen} />
    </Stack.Navigator>
  )
}
