import { FlatList, Modal, Pressable, SafeAreaView, Text, View } from 'react-native'
import { useState } from 'react'

type Props = {
  value: string
  onChange: (region: string) => void
}

const REGIONS: Record<string, string[]> = {
  서울특별시: [
    '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구',
    '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구',
    '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구',
  ],
  부산광역시: [
    '강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구',
    '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구',
  ],
  대구광역시: ['달서구', '달성군', '동구', '북구', '서구', '수성구', '중구', '남구'],
  인천광역시: ['계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '옹진군', '중구', '강화군'],
  광주광역시: ['광산구', '남구', '동구', '북구', '서구'],
  대전광역시: ['대덕구', '동구', '서구', '유성구', '중구'],
  울산광역시: ['남구', '동구', '북구', '울주군', '중구'],
  세종특별자치시: ['세종시 전체'],
  경기도: [
    '수원시', '고양시', '용인시', '성남시', '부천시', '화성시', '안산시', '남양주시',
    '안양시', '평택시', '시흥시', '파주시', '의정부시', '김포시', '광주시', '광명시',
    '군포시', '하남시', '오산시', '이천시', '안성시', '양주시', '구리시', '포천시',
    '의왕시', '여주시', '동두천시', '과천시', '가평군', '양평군', '연천군',
  ],
  강원도: ['춘천시', '원주시', '강릉시', '동해시', '태백시', '속초시', '삼척시'],
  충청북도: ['청주시', '충주시', '제천시', '보은군', '옥천군', '영동군'],
  충청남도: ['천안시', '공주시', '보령시', '아산시', '서산시', '논산시', '계룡시', '당진시'],
  전라북도: ['전주시', '군산시', '익산시', '정읍시', '남원시', '김제시'],
  전라남도: ['목포시', '여수시', '순천시', '나주시', '광양시'],
  경상북도: ['포항시', '경주시', '김천시', '안동시', '구미시', '영주시', '영천시', '상주시', '문경시', '경산시'],
  경상남도: ['창원시', '진주시', '통영시', '사천시', '김해시', '밀양시', '거제시', '양산시'],
  제주특별자치도: ['제주시', '서귀포시'],
}

const PROVINCES = Object.keys(REGIONS)

export function RegionSelector({ value, onChange }: Props) {
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)

  const handleSelectDistrict = (district: string) => {
    onChange(`${selectedProvince} ${district}`)
    setModalVisible(false)
    setSelectedProvince(null)
  }

  const handleBack = () => {
    setSelectedProvince(null)
  }

  const handleClose = () => {
    setModalVisible(false)
    setSelectedProvince(null)
  }

  const displayValue = value || '지역 선택'

  return (
    <>
      <Pressable
        hitSlop={8}
        onPress={() => setModalVisible(true)}
        className="h-[50px] flex-row items-center justify-between rounded-lg border border-gray1 bg-white px-4"
      >
        <Text
          className={`text-small1 ${value ? 'text-gray3' : 'text-gray2'}`}
          style={{ fontFamily: 'Pretendard-Medium' }}
        >
          {displayValue}
        </Text>
        <Text className="text-gray2 text-small1">▼</Text>
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={handleClose}>
        <Pressable className="flex-1 bg-black/40" onPress={handleClose} />
        <SafeAreaView className="bg-white rounded-t-2xl" style={{ maxHeight: '60%' }}>
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray1 px-5 py-4">
            {selectedProvince ? (
              <Pressable hitSlop={8} onPress={handleBack}>
                <Text className="text-gray3 text-small1" style={{ fontFamily: 'Pretendard-Medium' }}>
                  ← 뒤로
                </Text>
              </Pressable>
            ) : (
              <View style={{ width: 40 }} />
            )}
            <Text className="text-gray3 font-semibold" style={{ fontFamily: 'Pretendard-SemiBold' }}>
              {selectedProvince ?? '도/시 선택'}
            </Text>
            <Pressable hitSlop={8} onPress={handleClose}>
              <Text className="text-gray2 text-small1">✕</Text>
            </Pressable>
          </View>

          {/* Province list */}
          {!selectedProvince && (
            <FlatList
              data={PROVINCES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  hitSlop={8}
                  onPress={() => setSelectedProvince(item)}
                  className="border-b border-gray1 px-5 py-4"
                >
                  <Text
                    className="text-gray3 text-small1"
                    style={{ fontFamily: 'Pretendard-Medium' }}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          )}

          {/* District list */}
          {selectedProvince && (
            <FlatList
              data={REGIONS[selectedProvince]}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  hitSlop={8}
                  onPress={() => handleSelectDistrict(item)}
                  className="border-b border-gray1 px-5 py-4"
                >
                  <Text
                    className="text-gray3 text-small1"
                    style={{ fontFamily: 'Pretendard-Medium' }}
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>
    </>
  )
}
