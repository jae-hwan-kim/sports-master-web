import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { FlatList, Pressable, Text, View } from 'react-native'
import { useCallback } from 'react'

type Props = {
  images: string[]
  onChange: (images: string[]) => void
  maxCount?: number
}

const THUMBNAIL_SIZE = 88
const COLUMNS = 3
const GAP = 8

export function ImageUploadGrid({ images, onChange, maxCount = 5 }: Props) {
  const canAdd = images.length < maxCount

  const pickImages = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxCount - images.length,
    })

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri)
      onChange([...images, ...newUris].slice(0, maxCount))
    }
  }, [images, maxCount, onChange])

  const removeImage = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index))
    },
    [images, onChange]
  )

  // Build data: existing images + optional add button
  type GridItem = { type: 'image'; uri: string; index: number } | { type: 'add' }
  const data: GridItem[] = [
    ...images.map((uri, index) => ({ type: 'image' as const, uri, index })),
    ...(canAdd ? [{ type: 'add' as const }] : []),
  ]

  return (
    <FlatList<GridItem>
      data={data}
      keyExtractor={(item, i) => (item.type === 'image' ? item.uri : `add-${i}`)}
      numColumns={COLUMNS}
      scrollEnabled={false}
      columnWrapperStyle={{ gap: GAP }}
      ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
      renderItem={({ item }) => {
        if (item.type === 'add') {
          return (
            <Pressable
              hitSlop={8}
              onPress={pickImages}
              className="items-center justify-center rounded-lg border border-dashed border-gray1 bg-white"
              style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
            >
              <Text className="text-gray2" style={{ fontSize: 28 }}>+</Text>
              <Text
                className="text-gray2 text-small2"
                style={{ fontFamily: 'Pretendard-Medium' }}
              >
                {images.length}/{maxCount}
              </Text>
            </Pressable>
          )
        }

        return (
          <View style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}>
            <Image
              source={{ uri: item.uri }}
              style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE, borderRadius: 8 }}
              contentFit="cover"
            />
            <Pressable
              hitSlop={4}
              onPress={() => removeImage(item.index)}
              className="absolute right-1 top-1 h-5 w-5 items-center justify-center rounded-full bg-black/60"
            >
              <Text className="text-white" style={{ fontSize: 10 }}>
                ✕
              </Text>
            </Pressable>
          </View>
        )
      }}
    />
  )
}
