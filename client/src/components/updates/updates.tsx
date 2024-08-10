import AlertModal from 'components/alert-modal'
import {toHTML} from 'discord-markdown'
import {getUpdates} from 'logic/session/session-selectors'
import {useEffect, useRef} from 'react'
import {useSelector} from 'react-redux'
import sanitize from 'sanitize-html'
import css from './updates.module.scss'

type UpdatesModalProps = {
	updatesOpen: boolean
	setUpdatesOpen: (a1: boolean) => void
}

export function UpdatesModal({updatesOpen, setUpdatesOpen}: UpdatesModalProps) {
	const updates = useSelector(getUpdates)
	const latestUpdateElement = useRef<HTMLLIElement>(null)
	useEffect(() => {
		latestUpdateElement.current?.scrollIntoView({
			behavior: 'instant',
			block: 'start',
		})
	})

	return (
		<AlertModal
			setOpen={updatesOpen}
			onClose={() => {
				setUpdatesOpen(false)
				localStorage.setItem(
					'latestUpdateView',
					(new Date().valueOf() / 1000).toFixed(),
				)
			}}
			cancelText="Close"
			title="Latest updates"
			action={() => {}}
			description={
				<ul className={css.updatesList}>
					{updates ? (
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
						<li className={css.updateItem}>Failed to load updates</li>
					)}
					<li key={20} className={css.updateItem}>
						For more updates, visit the HC-TCG discord.
					</li>
				</ul>
			}
		/>
	)
}

export default UpdatesModal
