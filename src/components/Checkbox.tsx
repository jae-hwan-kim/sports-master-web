import { Pressable, View } from 'react-native'

import { Text } from '@/components/AppText'

type CheckboxProps = {
  label: string
  checked: boolean
  onToggle: () => void
}

export function Checkbox({ label, checked, onToggle }: CheckboxProps) {
  return (
    <Pressable hitSlop={8} onPress={onToggle} className="min-h-11 flex-row items-center gap-2">
      <View
        className={`items-center justify-center rounded border ${
          checked ? 'border-primary bg-primary' : 'border-gray1 bg-transparent'
        }`}
        style={{ height: 20, width: 20 }}
      >
        {checked && (
          <Text className="font-medium text-white" style={{ fontSize: 11 }}>
            ✓
          </Text>
        )}
      </View>
      <Text className="font-medium text-gray3" style={{ fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  )
}
