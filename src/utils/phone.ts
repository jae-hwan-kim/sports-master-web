// 센터 연락처 — 저장은 숫자만, 화면에는 하이픈 자동 표시 (iOS phone-pad에는 '-' 키가 없음)
export const PHONE_MAX_DIGITS = 11

export function toPhoneDigits(text: string): string {
  return text.replace(/\D/g, '').slice(0, PHONE_MAX_DIGITS)
}

// 02(서울) 2-3/4-4, 그 외 3-3/4-4 — 입력 중 부분 값도 단계별로 포맷
export function formatPhone(digits: string): string {
  const d = toPhoneDigits(digits)
  const area = d.startsWith('02') ? 2 : 3
  if (d.length <= area) return d
  const rest = d.slice(area)
  // 가운데 자리: 전체가 최대 길이(02는 10, 그 외 11)일 때만 4자리
  const midLen = d.length >= (area === 2 ? 10 : 11) ? 4 : 3
  if (rest.length <= midLen) return `${d.slice(0, area)}-${rest}`
  return `${d.slice(0, area)}-${rest.slice(0, midLen)}-${rest.slice(midLen)}`
}

export function isValidPhone(digits: string): boolean {
  return /^0\d{8,10}$/.test(digits)
}
