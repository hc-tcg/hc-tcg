import {Tag} from 'common/types/deck'
import Button from 'components/button'
import Modal from 'components/modal'
import css from 'components/tags-modal/tags-modal.module.scss'
import {deleteTag} from 'logic/saved-decks/saved-decks'
import {useState} from 'react'

type Props = {
	tags: Array<Tag>
	onClose: () => void
}

export function TagsModal({onClose, tags}: Props) {
	const [tagsList, setTagsList] = useState<Array<Tag>>(tags)
	return (
		<Modal title="Manage Tags" onClose={onClose}>
			<Modal.Description>
				{tagsList.map((tag) => (
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
								deleteTag(tag)
							}}
						>
							Remove
						</Button>
					</div>
				))}
			</Modal.Description>
		</Modal>
	)
}
