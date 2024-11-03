import {Tag} from 'common/types/deck'
import Button from 'components/button'
import {Modal} from 'components/modal'
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
		<Modal setOpen={setOpen} title="Manage Tags" onClose={onClose}>
			<Modal.Description>
				{tagsList.length
					? tagsList.map((tag) => (
							<div className={css.container}>
								<div className={css.component}>
									<div
										className={css.fullTagColor}
										style={{
											backgroundColor: tag.color,
										}}
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
						))
					: 'No tags yet! You can create one from the deck edit screen.'}
			</Modal.Description>
		</Modal>
	)
}
