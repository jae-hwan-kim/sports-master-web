import Svg, { Path } from 'react-native-svg'

type IconProps = {
  size?: number
  color?: string
  off?: boolean
}

export function VisibilityIcon({ size = 24, color = '#74768E', off = false }: IconProps) {
  if (off) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          fill={color}
          d="M12 6.5c3.79 0 7.17 2.13 8.82 5.5-.59 1.2-1.42 2.27-2.42 3.16l1.41 1.41c1.39-1.23 2.49-2.77 3.19-4.57C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65c.64-.16 1.3-.22 1.99-.22zM2 3.27l2.28 2.28.46.46C3.08 7.3 1.78 9 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l.42.42L19.73 21 21 19.73 3.27 2 2 3.27zM7.53 8.8l1.55 1.55c-.05.21-.08.42-.08.65 0 1.66 1.34 3 3 3 .23 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78 3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
        />
      </Svg>
    )
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M12 6C7 6 2.73 9.11 1 13.5 2.73 17.89 7 21 12 21s9.27-3.11 11-7.5C21.27 9.11 17 6 12 6zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
      />
    </Svg>
  )
}
