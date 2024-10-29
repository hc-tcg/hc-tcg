import * as AlertDialog from '@radix-ui/react-alert-dialog'
import cn from 'classnames'
import Button from 'components/button'
import {ReactNode} from 'react'
import css from './alert-modal.module.scss'
import {ButtonVariant} from 'common/types/buttons'

type AlertModal = {
	setOpen: boolean
	onClose: () => void
	action: () => void
	title: ReactNode
	description: ReactNode
	cancelText?: string
	actionText?: string
	actionType?: ButtonVariant
	buttonDirection?: 'row' | 'column'
}

const AlertModal = ({
	setOpen,
	onClose,
	title,
	description,
	actionText,
	actionType,
	action,
	buttonDirection,
	cancelText,
}: AlertModal) => (
	<AlertDialog.Root open={setOpen} onOpenChange={onClose}>
		<AlertDialog.Portal container={document.getElementById('modal')}>
			<AlertDialog.Overlay className={css.AlertDialogOverlay}>
				<AlertDialog.Content className={css.AlertDialogContent}>
					<AlertDialog.Title className={css.AlertDialogTitle}>
						{title}
						<AlertDialog.Cancel className={css.xClose}>
							<img src="/images/CloseX.svg" alt="close" />
						</AlertDialog.Cancel>
					</AlertDialog.Title>
					<div className={css.AlertDialogDescription}>{description}</div>
					<div
						className={cn(
							css.buttonContainer,
							buttonDirection === 'column' && css.column,
						)}
					>
						<AlertDialog.Cancel asChild>
							<Button.Ref>{cancelText || 'Cancel'}</Button.Ref>
						</AlertDialog.Cancel>
						{actionText && (
							<AlertDialog.Action asChild>
								<Button.Ref variant={actionType || 'error'} onClick={action}>
									{actionText}
								</Button.Ref>
							</AlertDialog.Action>
						)}
					</div>
				</AlertDialog.Content>
			</AlertDialog.Overlay>
		</AlertDialog.Portal>
	</AlertDialog.Root>
)

export default AlertModal
