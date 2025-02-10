import Button from 'components/button'
import {Modal} from 'components/modal'
import {toHTML} from 'discord-markdown'
import {getUpdates} from 'logic/session/session-selectors'
import {useEffect, useRef} from 'react'
import {useSelector} from 'react-redux'
import sanitize from 'sanitize-html'
import css from './updates.module.scss'

type UpdatesModalProps = {
	onClose: () => void
}

export function UpdatesModal({onClose}: UpdatesModalProps) {
	const updates = useSelector(getUpdates)
	const latestUpdateElement = useRef<HTMLLIElement>(null)
	useEffect(() => {
		latestUpdateElement.current?.scrollIntoView({
			behavior: 'instant',
			block: 'start',
		})
	})

	localStorage.setItem(
		'latestUpdateView',
		(new Date().valueOf() / 1000).toFixed(),
	)

	return (
		<Modal setOpen title="Latest Updates" onClose={onClose} disableCloseButton>
			<Modal.Description>
				<ul className={css.updatesList}>
					<li key={15} className={css.updateItem}>
						For more updates, visit the HC-TCG discord.
					</li>
					{updates ? (
						updates.map(({tag, description, link, timestamp}, i) => {
							return (
								<>
									<li
										className={css.updateItem}
										key={i + 1}
										ref={i === 0 ? latestUpdateElement : undefined}
									>
										<a href={link} target="_blank">
											<h1 className={css.updateName}> Update {tag} </h1>
										</a>
										<span className={css.shortDate}>
											{new Date(timestamp * 1000).toLocaleDateString()}
										</span>
										<div
											dangerouslySetInnerHTML={{
												__html: sanitize(toHTML(description)),
											}}
										/>
									</li>
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
