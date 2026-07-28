import type { SvgProps } from 'react-native-svg'

import AppleSvg from './apple.svg'
import BackSvg from './back.svg'
import GoogleSvg from './google.svg'
import KakaoSvg from './kakao.svg'
import SettingsSvg from './settings.svg'
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
