import { isAxiosError } from 'axios'
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, '*이메일을 입력해주세요').email('올바르지 않은 이메일 형식입니다'),
  password: z
    .string()
    .min(1, '*비밀번호를 입력해주세요')
    .regex(/^(?=.*[a-z])(?=.*[0-9]).{8,}$/, '비밀번호는 소문자, 숫자를 포함한 8자 이상입니다'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export function isInvalidCredentialsError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 401
}

export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    if (!error.response) return '네트워크 연결을 확인해주세요'
    const message = error.response.data?.message
    if (typeof message === 'string') return message
    if (Array.isArray(message) && typeof message[0] === 'string') return message[0]
    if (error.response.status === 401) return '이메일 또는 비밀번호가 올바르지 않습니다'
  }
  return fallback
}
