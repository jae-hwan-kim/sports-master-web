import { isAxiosError } from 'axios'
import { z } from 'zod'

export const signUpSchema = z.object({
  nickname: z
    .string()
    .min(1, '닉네임을 입력해주세요')
    .max(8, '띄어쓰기 없이 한글, 영문 8자 이내입니다')
    .regex(/^\S+$/, '띄어쓰기 없이 한글, 영문 8자 이내입니다'),
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바르지 않은 이메일 형식입니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요')
    .regex(
      /^(?=.*[a-z])(?=.*[0-9]).{8,12}$/,
      '비밀번호는 소문자, 숫자를 포함한 8~12자입니다'
    ),
})

export type SignUpFormValues = z.infer<typeof signUpSchema>

export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    if (!error.response) return '네트워크 연결을 확인해주세요'
    const message = error.response.data?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message) && typeof message[0] === 'string') return message[0]
  }
  return fallback
}

function getApiErrorText(error: unknown): string {
  if (!isAxiosError(error) || !error.response) return ''
  const message = error.response.data?.message
  if (typeof message === 'string') return message
  if (Array.isArray(message)) return message.join(' ')
  return ''
}

// 백엔드가 필드별 에러 코드를 별도로 내려주지 않아, 메시지 텍스트 키워드로 임시 판별합니다.
// (정확한 구분을 위해서는 백엔드에 필드별 에러코드 응답 스펙 추가가 필요 — notes 참고)
// NOTE: 현재 auth.service.ts의 register()는 닉네임 중복 검사를 하지 않아(email만 조회) 서버가
// 이 케이스의 에러를 내려주지 않습니다. 백엔드에 닉네임 유니크 검증이 추가되기 전까지는 실질적으로
// 도달하지 않는 분기입니다.
export function isNicknameDuplicateError(error: unknown): boolean {
  const text = getApiErrorText(error)
  return text.includes('닉네임') || text.includes('이름')
}

export function isEmailDuplicateError(error: unknown): boolean {
  const text = getApiErrorText(error)
  return (
    text.includes('이메일') &&
    (text.includes('중복') || text.includes('사용중') || text.includes('가입된'))
  )
}

export function isEmailFormatError(error: unknown): boolean {
  const text = getApiErrorText(error)
  return text.includes('이메일') && text.includes('형식')
}

export function isPasswordFormatError(error: unknown): boolean {
  const text = getApiErrorText(error)
  return text.includes('비밀번호')
}

export function validateNicknameFormat(value: string): string | null {
  if (!value || value.trim() === '' || /\s/.test(value) || value.length > 8) {
    return '닉네임은 최대8자 입니다\n(숫자,특수기호,한글,영문 조합)'
  }
  return null
}

export function validateEmailFormat(value: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!value || !emailRegex.test(value)) return '정확한 이메일 형식을 확인해주세요'
  return null
}

export type SignUpFieldError = {
  field: 'nickname' | 'email' | 'password' | 'form'
  message: string
}

// 계정 생성(register) 호출이 SignUp 화면이 아닌 이후 화면(MasterVerification/CustomerWelcome)에서
// 일어나므로, 실패 시 어느 필드 에러인지 판별해 SignUp 화면으로 돌아가 보여줄 수 있도록 매핑한다.
export function mapSignUpError(error: unknown): SignUpFieldError {
  if (isNicknameDuplicateError(error)) {
    return { field: 'nickname', message: '이미 사용중인 닉네임입니다' }
  }
  if (isEmailFormatError(error)) {
    return { field: 'email', message: '올바르지 않은 이메일 형식입니다' }
  }
  if (isEmailDuplicateError(error)) {
    return { field: 'email', message: '이미 사용중인 이메일입니다' }
  }
  if (isPasswordFormatError(error)) {
    return { field: 'password', message: '비밀번호 형식이 올바르지 않습니다' }
  }
  return {
    field: 'form',
    message: extractApiErrorMessage(error, '회원가입에 실패했습니다. 잠시 후 다시 시도해주세요'),
  }
}
