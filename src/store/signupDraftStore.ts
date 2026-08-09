import { create } from 'zustand'

export type SignUpFieldError = {
  field: 'nickname' | 'email' | 'password' | 'form'
  message: string
}

type SignUpDraft = { nickname: string; email: string; password: string }

// 회원가입 계정 생성(POST /auth/register) 시점을 SignUp 제출에서 역할 확정 시점
// (MasterVerification 선택완료/나중에, CustomerWelcome 진입)으로 미루기 위해
// 입력값을 잠시 보관하는 store — 계정 생성 성공/실패 즉시 clearDraft로 비운다.
type SignUpDraftState = {
  draft: SignUpDraft | null
  pendingError: SignUpFieldError | null
  setDraft: (draft: SignUpDraft) => void
  clearDraft: () => void
  setPendingError: (error: SignUpFieldError) => void
  consumePendingError: () => SignUpFieldError | null
}

export const useSignUpDraftStore = create<SignUpDraftState>((set, get) => ({
  draft: null,
  pendingError: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
  setPendingError: (error) => set({ pendingError: error }),
  consumePendingError: () => {
    const error = get().pendingError
    if (error) set({ pendingError: null })
    return error
  },
}))
