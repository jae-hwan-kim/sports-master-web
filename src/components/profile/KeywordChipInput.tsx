import { FlatList, Pressable, Text, TextInput, View } from 'react-native'
import { useRef, useState } from 'react'

import { Chip } from '@/components/Chip'

type Props = {
  keywords: string[]
  onChange: (keywords: string[]) => void
}

export function KeywordChipInput({ keywords, onChange }: Props) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<TextInput>(null)

  const addKeyword = () => {
    const trimmed = inputValue.trim()
    if (!trimmed || keywords.includes(trimmed)) {
      setInputValue('')
      return
    }
    onChange([...keywords, trimmed])
    setInputValue('')
  }

  const removeKeyword = (target: string) => {
    onChange(keywords.filter((k) => k !== target))
  }

  return (
    <View className="gap-2">
      {/* Input row */}
      <View className="flex-row items-center gap-2">
        <TextInput
          ref={inputRef}
          className="h-[44px] flex-1 rounded-lg border border-gray1 bg-white px-3 text-gray3 text-small1"
          style={{ fontFamily: 'Pretendard-Medium' }}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="키워드 입력 후 추가"
          placeholderTextColor="#74768E"
          returnKeyType="done"
          onSubmitEditing={addKeyword}
        />
        <Pressable
          hitSlop={8}
          onPress={addKeyword}
          className="h-[44px] items-center justify-center rounded-lg bg-primary px-4"
        >
          <Text className="text-white text-small1" style={{ fontFamily: 'Pretendard-Medium' }}>
            추가
          </Text>
        </Pressable>
      </View>

      {/* Chip list */}
      {keywords.length > 0 && (
        <FlatList
          data={keywords}
          keyExtractor={(item, index) => `${item}-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          renderItem={({ item }) => (
            <View className="flex-row items-center gap-1">
              <Chip label={item} selected />
              <Pressable
                hitSlop={8}
                onPress={() => removeKeyword(item)}
                className="h-5 w-5 items-center justify-center rounded-full bg-gray2"
              >
                <Text className="text-white" style={{ fontSize: 10 }}>
                  ✕
                </Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  )
}
