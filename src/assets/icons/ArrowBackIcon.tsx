import Svg, { Path } from 'react-native-svg'

type IconProps = {
  size?: number
  color?: string
}

export function ArrowBackIcon({ size = 24, color = '#07091C' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path fill={color} d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z" />
    </Svg>
  )
}
