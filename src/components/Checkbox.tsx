import { Pressable, Text, View } from 'react-native'
import { moderateScale, scale } from 'react-native-size-matters'

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
          checked ? 'border-secondary bg-secondary' : 'border-gray1 bg-transparent'
        }`}
        style={{ height: scale(20), width: scale(20) }}
      >
        {checked && (
          <Text className="font-medium text-white" style={{ fontSize: moderateScale(11) }}>
            ✓
          </Text>
        )}
      </View>
      <Text className="font-medium text-gray3" style={{ fontSize: moderateScale(13) }}>
        {label}
      </Text>
    </Pressable>
  )
}
