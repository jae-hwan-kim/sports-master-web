import { ConfirmDialog } from '@/components/ConfirmDialog'

type Props = {
  visible: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteRequestDialog({ visible, onConfirm, onCancel }: Props) {
  return (
    <ConfirmDialog
      visible={visible}
      title="리뷰 삭제를 진행할까요?"
      description={'요청된 리뷰는 검토 후 승인, 기각됩니다.\n( 검토 후 7일 안에 처리됩니다)'}
      confirmLabel="요청하기"
      cancelLabel="취소"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
