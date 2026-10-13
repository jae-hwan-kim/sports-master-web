import { Pressable } from 'react-native'

import { Text } from '@/components/AppText'

type SurveyKeywordChipProps = {
  label: string
  selected: boolean
  onPress: () => void
}

export function SurveyKeywordChip({ label, selected, onPress }: SurveyKeywordChipProps) {
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      className={`h-[26px] items-center justify-center rounded-[82px] border px-3 ${
        selected ? 'border-primary bg-primary' : 'border-gray2 bg-gray2'
      }`}
    >
      <Text className="font-pretendard-medium text-[#F2F2F2]" style={{ fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  )
}
