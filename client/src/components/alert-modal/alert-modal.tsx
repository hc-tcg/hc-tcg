import {ReactNode} from 'react'
import cn from 'classnames'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import css from './alert-modal.module.scss'
import Button from 'components/button'

type AlertModal = {
	setOpen: boolean
	onClose: () => void
	action: () => void
	title: ReactNode
	description: ReactNode
	actionText: string
	buttonDirection?: 'row' | 'column'
}

const AlertModal = ({
	setOpen,
	onClose,
	title,
	description,
	actionText,
	action,
	buttonDirection,
}: AlertModal) => (
	<AlertDialog.Root open={setOpen} onOpenChange={onClose}>
		<AlertDialog.Portal container={document.getElementById('modal')}>
			<AlertDialog.Overlay className={css.AlertDialogOverlay} />
			<AlertDialog.Content className={css.AlertDialogContent}>
				<AlertDialog.Title className={css.AlertDialogTitle}>
					{title}
					<AlertDialog.Cancel className={css.xClose}>
						<img src="/images/CloseX.svg" alt="close" />
					</AlertDialog.Cancel>
				</AlertDialog.Title>
				<AlertDialog.Description className={css.AlertDialogDescription}>
					{description}
				</AlertDialog.Description>
				<div
					className={cn(
						css.buttonContainer,
						buttonDirection === 'column' && css.column
					)}
				>
					<AlertDialog.Cancel asChild>
						<Button.Ref>Cancel</Button.Ref>
					</AlertDialog.Cancel>
					<AlertDialog.Action asChild>
						<Button.Ref variant="error" onClick={action}>
							{actionText}
						</Button.Ref>
					</AlertDialog.Action>
				</div>
			</AlertDialog.Content>
		</AlertDialog.Portal>
	</AlertDialog.Root>
)

export default AlertModal
