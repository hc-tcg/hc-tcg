import {toHTML} from 'discord-markdown'
import {getUpdates} from 'logic/session/session-selectors'
import {useEffect, useRef} from 'react'
import {useSelector} from 'react-redux'
import sanitize from 'sanitize-html'
import css from './updates.module.scss'
import {Modal} from 'components/modal'
import Button from 'components/button'

type UpdatesModalProps = {
	onClose: () => void
}

export function UpdatesModal({onClose}: UpdatesModalProps) {
	const updates = Object.values(useSelector(getUpdates))
	console.log(updates)
	const latestUpdateElement = useRef<HTMLLIElement>(null)
	useEffect(() => {
		latestUpdateElement.current?.scrollIntoView({
			behavior: 'instant',
			block: 'start',
		})
	})

	return (
		<Modal setOpen title="Latest Updates" onClose={onClose} disableCloseButton>
			<Modal.Description>
				<ul className={css.updatesList}>
					<li key={20} className={css.updateItem}>
						For more updates, visit the HC-TCG discord.
					</li>
					{updates.length ? (
						Object.values(updates)
							.flatMap((value) => value)
							.map((text, i) => {
								return (
									<>
										<li
											className={css.updateItem}
											key={i + 1}
											dangerouslySetInnerHTML={{__html: sanitize(toHTML(text))}}
											ref={i === 0 ? latestUpdateElement : undefined}
										/>
										<hr key={-i} className={css.updateSeperator} />
									</>
								)
							})
					) : (
						<li className={css.updateItem}>Failed to load updates.</li>
					)}
				</ul>
			</Modal.Description>
			<Modal.Options fillSpace>
				<Button onClick={onClose}>Close</Button>
			</Modal.Options>
		</Modal>
	)
}

export default UpdatesModal
