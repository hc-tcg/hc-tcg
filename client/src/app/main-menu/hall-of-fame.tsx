import MenuLayout from 'components/menu-layout'
import {useMessageDispatch} from 'logic/messages'
import css from './main-menu.module.scss'
import {useState} from 'react'
import {ScreenshotDeckModal} from 'components/import-export'
import {LocalCardInstance} from 'common/types/server-requests'
import Button from 'components/button'

type Props = {
	setMenuSection: (section: string) => void
}

function HallOfFame({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()

	const [screenshotDeckModalContents, setScreenshotDeckModalContents] =
		useState<Array<LocalCardInstance> | null>(null)

	const [data, setData] = useState<Record<any, any> | null>(null)
	const [selectedEndpoint, setSelectedEndpoint] = useState<string>('decks')

	async function getData() {
		const url =
			'https://hc-tcg.online/api/stats/decks?minimumWins=10&orderBy=winrate'
		try {
			const response = await fetch(url)
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`)
			}

			const json = await response.json()
			console.log(json)
			setData(json)
		} catch (err) {
			console.error('Chat error: ', err)
		}
	}

	if (!data) getData()

	const parseArray = (arr: Array<any>) => {
		return (
			<div>
				{arr.map((element) => {
					if (typeof element === 'object') {
						if (Array.isArray(element)) {
							return (
								<div>
									{element}: {parseArray(element)}
								</div>
							)
						}

						return parseObject(element)
					}

					return <div>{element}</div>
				})}
			</div>
		)
	}

	const parseObject = (object: Record<any, any>): JSX.Element => {
		return (
			<div>
				{Object.keys(object).map((key) => {
					if (key === 'type') return null

					const value = object[key]

					if (value === null) return null

					if (typeof value === 'object') {
						if (Array.isArray(value)) {
							return (
								<div>
									{key}: {parseArray(value)}
								</div>
							)
						}

						return parseObject(value)
					}

					return (
						<div>
							{key}: {object[key]}
						</div>
					)
				})}
			</div>
		)
	}

	const parseDecks = (decks: Array<Record<string, any>>) => {
		return (
			<table className={css.hallOfFameTable}>
				<tr>
					<th>Code</th>
					<th>Winrate</th>
					<th>Wins</th>
					<th>Losses</th>
					<th>Cards</th>
				</tr>
				{decks.map((deck) => {
					return (
						<tr>
							<td>{deck.deck.code}</td>
							<td>{Math.round(deck.winrate * 10000) / 100}%</td>
							<td>{deck.wins}</td>
							<td>{deck.lossses}</td>
							<td>
								<Button
									onClick={() => {
										setScreenshotDeckModalContents([])
									}}
								>
									View
								</Button>
							</td>
						</tr>
					)
				})}
			</table>
		)
	}

	return (
		<>
			<MenuLayout
				back={() => setMenuSection('settings')}
				title="Hall of Fame"
				returnText="More"
				className={css.settingsMenu}
			>
				<h2> Hall of Fame </h2>
				<div className={css.bigHallOfFameArea}>
					{data && parseDecks(data.body)}
				</div>
			</MenuLayout>
			<ScreenshotDeckModal
				setOpen={screenshotDeckModalContents !== null}
				cards={screenshotDeckModalContents}
				onClose={() => setScreenshotDeckModalContents(null)}
			/>
		</>
	)
}

export default HallOfFame
