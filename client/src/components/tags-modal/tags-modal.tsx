import * as AlertDialog from '@radix-ui/react-dialog'
import {Tag} from 'common/types/deck'
import ModalCSS from 'components/alert-modal/alert-modal.module.scss'
import Button from 'components/button'
import css from 'components/tags-modal/tags-modal.module.scss'
import {deleteTag} from 'logic/saved-decks/saved-decks'
import {useState} from 'react'

type Props = {
	setOpen: boolean
	tags: Array<Tag>
	onClose: () => void
}

export function TagsModal({setOpen, onClose, tags}: Props) {
	const [tagsList, setTagsList] = useState<Array<Tag>>(tags)
	return (
		<AlertDialog.Root open={setOpen} onOpenChange={(e) => !e && onClose()}>
			<AlertDialog.Portal container={document.getElementById('modal')}>
				<AlertDialog.Overlay className={ModalCSS.AlertDialogOverlay} />
				<AlertDialog.Content className={ModalCSS.AlertDialogContent}>
					<AlertDialog.Title className={ModalCSS.AlertDialogTitle}>
						Manage Tags
						<AlertDialog.Close asChild>
							<button className={ModalCSS.xClose}>
								<img src="/images/CloseX.svg" alt="close" />
							</button>
						</AlertDialog.Close>
					</AlertDialog.Title>
					<AlertDialog.Description
						asChild
						className={ModalCSS.AlertDialogDescription}
					>
						<div>
							{tagsList.map((tag) => (
								<div className={css.container}>
									<div className={css.component}>
										<div
											className={css.fullTagColor}
											style={{backgroundColor: tag.color}}
										></div>
										<div>{tag.name}</div>
									</div>
									<Button
										variant="default"
										onClick={() => {
											setTagsList(tagsList.filter((t) => t.key !== tag.key))
											deleteTag(tag)
										}}
									>
										Remove
									</Button>
								</div>
							))}
						</div>
					</AlertDialog.Description>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}
