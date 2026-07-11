import { Pressable, Text, View } from 'react-native'

type CheckboxProps = {
  label: string
  checked: boolean
  onToggle: () => void
}

export function Checkbox({ label, checked, onToggle }: CheckboxProps) {
  return (
    <Pressable hitSlop={8} onPress={onToggle} className="min-h-11 flex-row items-center gap-2">
      <View
        className={`h-5 w-5 items-center justify-center rounded border ${
          checked ? 'border-primary bg-primary' : 'border-gray1 bg-transparent'
        }`}
      >
        {checked && <Text className="text-[11px] font-medium text-white">✓</Text>}
      </View>
      <Text className="text-[13px] font-medium text-gray3">{label}</Text>
    </Pressable>
  )
}
