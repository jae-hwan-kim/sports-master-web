import { create } from 'zustand'

type Gender = 'female' | 'male' | 'other'
type AgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | '60s_plus'

type OnboardingState = {
  selectedRegions: string[]
  gender: Gender | null
  ageGroup: AgeGroup | null
  setSelectedRegions: (regions: string[]) => void
  setGender: (gender: Gender) => void
  setAgeGroup: (ageGroup: AgeGroup) => void
  clearOnboarding: () => void
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  selectedRegions: [],
  gender: null,
  ageGroup: null,
  setSelectedRegions: (regions) => set({ selectedRegions: regions }),
  setGender: (gender) => set({ gender }),
  setAgeGroup: (ageGroup) => set({ ageGroup }),
  clearOnboarding: () => set({ selectedRegions: [], gender: null, ageGroup: null }),
}))
