import Button from 'components/button'
import {Modal} from 'components/modal'
import {toHTML} from 'discord-markdown'
import {useEffect, useRef, useState} from 'react'
import sanitize from 'sanitize-html'
import css from './updates.module.scss'

type UpdatesModalProps = {
	onClose: () => void
}

type Update = {
	name: string
	body: string
	url: string
}

export function UpdatesModal({onClose}: UpdatesModalProps) {
	const [data, setData] = useState<Update[]>()

	async function getReleases() {
		const res = await fetch('https://api.github.com/repos/hc-tcg/hc-tcg/releases')
		const json = await res.json()
		const updates: Update[] = []
		json.forEach((element: Record<string, any>) => {
			updates.push({
				name: element.name,
				body: element.body,
				url: element.html_url,
			})
		});
		setData(updates)
	}

	useEffect(() => {
		getReleases()
	}, [])

	return (
		<Modal setOpen title="Latest Updates" onClose={onClose} disableCloseButton>
			<Modal.Description>
				<ul className={css.updatesList}>
					{data && data.length ? (
						data.map((update, i) => {
								return (
									<>
										<li
											className={css.updateItem}
											key={i*2}
										>
											<h2><a href={update.url}>{update.name}</a></h2>
											<span dangerouslySetInnerHTML={{__html: sanitize(toHTML(update.body, {discordOnly: false}))}}></span>
										</li>
										<hr key={i*2+1} className={css.updateSeperator} />
									</>
								)
							})
					) : (
						<li className={css.updateItem}>Failed to load updates.</li>
					)}
					<li key={-1} className={css.updateItem}>
						For more updates, visit the HC-TCG discord.
					</li>
				</ul>
			</Modal.Description>
			<Modal.Options fillSpace>
				<Button onClick={getReleases}>Close</Button>
			</Modal.Options>
		</Modal>
	)
}

export default UpdatesModal
