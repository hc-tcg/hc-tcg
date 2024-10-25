import * as AlertDialog from '@radix-ui/react-dialog'
import {Tag} from 'common/types/deck'
import ModalCSS from 'components/alert-modal/alert-modal.module.scss'
import Button from 'components/button'
import css from 'components/tags-modal/tags-modal.module.scss'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useState} from 'react'
import {useSelector} from 'react-redux'

type Props = {
	setOpen: boolean
	onClose: () => void
}

export function TagsModal({setOpen, onClose}: Props) {
	const databaseInfo = useSelector(getLocalDatabaseInfo)
	const dispatch = useMessageDispatch()

	const [tagsList, setTagsList] = useState<Array<Tag>>(databaseInfo.tags)
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
											dispatch({
												type: localMessages.DELETE_TAG,
												tag: tag,
											})
											dispatch({
												type: localMessages.DATABASE_SET,
												data: {
													key: 'tags',
													value: tagsList.filter((t) => t.key !== tag.key),
												},
											})
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
