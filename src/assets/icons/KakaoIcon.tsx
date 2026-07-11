import Svg, { Path } from 'react-native-svg'

type IconProps = {
  size?: number
}

export function KakaoIcon({ size = 24 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill="#000000"
        d="M12 3C6.48 3 2 6.48 2 10.7c0 2.68 1.78 5.04 4.47 6.4l-1.14 4.15a.5.5 0 0 0 .77.55l4.9-3.24c.32.03.66.04 1 .04 5.52 0 10-3.48 10-7.9C22 6.48 17.52 3 12 3z"
      />
    </Svg>
  )
}
