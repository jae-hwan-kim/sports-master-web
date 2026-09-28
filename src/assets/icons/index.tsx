import type { SvgProps } from 'react-native-svg'

import AddAltSvg from './add-alt.svg'
import AppleSvg from './apple.svg'
import ArrowNextSvg from './arrow-next.svg'
import BackSvg from './back.svg'
import CustomerSvg from './customer.svg'
import DiagnosisSvg from './diagnosis.svg'
import EditSvg from './edit.svg'
import GoogleSvg from './google.svg'
import HomeSvg from './home.svg'
import KakaoSvg from './kakao.svg'
import LinkSvg from './link.svg'
import MasterSvg from './master.svg'
import PersonSvg from './person.svg'
import ProfilePersonSvg from './profile-person.svg'
import SearchSvg from './search.svg'
import SettingsSvg from './settings.svg'
import StarFillSvg from './star-fill.svg'
import StarMedalSvg from './star-medal.svg'
import StarNoneSvg from './star-none.svg'
import VisibilityOffSvg from './visibility-off.svg'
import VisibilityOnSvg from './visibility-on.svg'

type IconProps = { size?: number } & Omit<SvgProps, 'width' | 'height'>

// back/visibility 에셋은 Figma에서 44x44 탭 영역 전체를 포함해 내보내져 있어
// (실제 글리프는 내부 24x24), 그래서 44로 렌더링해야 원본과 동일한 크기로 보임
export function ArrowBackIcon({ size = 44, ...rest }: IconProps) {
  return <BackSvg width={size} height={size} {...rest} />
}

export function SettingsIcon({ size = 44, ...rest }: IconProps) {
  return <SettingsSvg width={size} height={size} {...rest} />
}

// add-alt는 44x44 탭 영역 전체(내부 24x24 글리프 + 여백)를 포함해 내보내져 있어 44로 렌더링
export function AddCircleIcon({ size = 44, ...rest }: IconProps) {
  return <AddAltSvg width={size} height={size} {...rest} />
}

export function VisibilityIcon({ size = 44, off = false, ...rest }: IconProps & { off?: boolean }) {
  const Icon = off ? VisibilityOffSvg : VisibilityOnSvg
  return <Icon width={size} height={size} {...rest} />
}

// 구글/카카오/애플 아이콘은 자체 여백 없는 글리프라 지정한 size 그대로 렌더링
export function GoogleIcon({ size = 24, ...rest }: IconProps) {
  return <GoogleSvg width={size} height={(size * 24) / 25} {...rest} />
}

export function KakaoIcon({ size = 24, ...rest }: IconProps) {
  return <KakaoSvg width={size} height={size} {...rest} />
}

export function AppleIcon({ size = 24, ...rest }: IconProps) {
  return <AppleSvg width={(size * 19) / 24} height={size} {...rest} />
}

// arrow-next 에셋은 44x44 탭 영역 전체를 포함해 내보내져 있어(실제 화살표 글리프는 내부),
// 44로 렌더링해야 원본과 동일한 크기로 보임
export function ArrowNextIcon({ size = 44, ...rest }: IconProps) {
  return <ArrowNextSvg width={size} height={size} {...rest} />
}

// master/customer는 자체 색상을 가진 54x54 글리프(RoleCard 배지용)
export function MasterIcon({ size = 54, ...rest }: IconProps) {
  return <MasterSvg width={size} height={size} {...rest} />
}

export function CustomerIcon({ size = 54, ...rest }: IconProps) {
  return <CustomerSvg width={size} height={size} {...rest} />
}

export function StarFillIcon({ size = 16, ...rest }: IconProps) {
  return <StarFillSvg width={size} height={size} {...rest} />
}

export function StarNoneIcon({ size = 16, ...rest }: IconProps) {
  return <StarNoneSvg width={size} height={size} {...rest} />
}

// 하단 탭바 아이콘 (44x44 탭 영역 포함)
export function HomeTabIcon({ size = 44, ...rest }: IconProps) {
  return <HomeSvg width={size} height={size} {...rest} />
}

export function DiagnosisTabIcon({ size = 44, ...rest }: IconProps) {
  return <DiagnosisSvg width={size} height={size} {...rest} />
}

export function ProfileTabIcon({ size = 44, ...rest }: IconProps) {
  return <PersonSvg width={size} height={size} {...rest} />
}

// search.svg는 44x44 탭 영역 포함 (내부 24x24 글리프 + 여백)
export function SearchTabIcon({ size = 44, ...rest }: IconProps) {
  return <SearchSvg width={size} height={size} {...rest} />
}

export function LinkIcon({ size = 44, ...rest }: IconProps) {
  return <LinkSvg width={size} height={size} {...rest} />
}

export function StarMedalIcon({ size = 100, ...rest }: IconProps) {
  return <StarMedalSvg width={size} height={size} {...rest} />
}

// edit.svg는 자체 여백 없는 24x24 글리프
export function EditIcon({ size = 24, ...rest }: IconProps) {
  return <EditSvg width={size} height={size} {...rest} />
}

// profile-person.svg는 프로필 아바타용 실루엣 아이콘 (원본 88×104, 비율 유지)
export function ProfilePersonIcon({ size = 54, ...rest }: IconProps) {
  return <ProfilePersonSvg width={size} height={(size * 104) / 88} {...rest} />
}

