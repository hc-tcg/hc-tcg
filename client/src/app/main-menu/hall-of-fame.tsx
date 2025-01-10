import {CARDS} from 'common/cards'
import {Card, isHermit, isItem} from 'common/cards/types'
import Button from 'components/button'
import {ScreenshotDeckModal} from 'components/import-export'
import MenuLayout from 'components/menu-layout'
import {useMessageDispatch} from 'logic/messages'
import {useState} from 'react'
import css from './main-menu.module.scss'
import Dropdown from 'components/dropdown'

type Props = {
	setMenuSection: (section: string) => void
}

function HallOfFame({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()

	const [screenshotDeckModalContents, setScreenshotDeckModalContents] =
		useState<Array<Card> | null>(null)

	const [data, setData] = useState<any | null>(null)
	const [selectedEndpoint, setSelectedEndpoint] = useState<'decks' | 'cards'>('decks')

	const endpoints = {
		decks: 'decks?minimumWins=10&orderBy=winrate',
		cards: 'cards',
	}

	async function getData() {
		const url =
			`https://hc-tcg.online/api/stats/${endpoints[selectedEndpoint]}`
		console.log(url)
		try {
			const response = await fetch(url)
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`)
			}

			const json = await response.json()
			setData(json)
		} catch (err) {
			console.error('Chat error: ', err)
		}
	}

	if (!data) getData()

	const parseDeckCards = (cards: Array<string>) => {
		return cards.map((card) => CARDS[card])
	}

	const getDeckTypes = (cards: Array<string>) => {
		const parsedCards = parseDeckCards(cards)
		const reducedCards = parsedCards.reduce((r: Array<string>, card) => {
			if (!isHermit(card) && !isItem(card)) return r
			if (!r.includes(card.type) && card.type !== 'any') r.push(card.type)
			return r
		}, [])
		return reducedCards.join(', ')
	}

	const parseDecks = (decks: Array<Record<string, any>>) => {
		return (
			<table className={css.hallOfFameTable}>
				<tr>
					<th>Code</th>
					<th>Winrate</th>
					<th>Wins</th>
					<th>Losses</th>
					<th>Included Types</th>
					<th>Cards</th>
				</tr>
				{decks.map((deck) => {
					return (
						<tr key={deck.deck.code}>
							<td>{deck.deck.code}</td>
							<td>{Math.round(deck.winrate * 10000) / 100}%</td>
							<td>{deck.wins}</td>
							<td>{deck.lossses}</td>
							<td>{getDeckTypes(deck.deck.cards)}</td>
							<td className={css.actionColumn}>
								<Button
									onClick={() => {
										setScreenshotDeckModalContents(
											parseDeckCards(deck.deck.cards),
										)
									}}
								>
									View
								</Button>
								<Button
									onClick={() => {
										navigator.clipboard.writeText(deck.deck.code)
									}}
								>
									Copy Hash
								</Button>
							</td>
						</tr>
					)
				})}
			</table>
		)
	}

	const parseCards = (cards: Array<Record<string, any>>) => {
		return (
			<table className={css.hallOfFameTable}>
				<tr>
					<th>Card Id</th>
					<th>Winrate</th>
					<th>in % decks</th>
					<th>in % games</th>
				</tr>
				{cards.map((card) => {
					console.log(card)
					return (
						<tr key={card.id}>
							<td>{card.id}</td>
							<td>{Math.round(card.winrate * 10000) / 100}%</td>
							<td>{Math.round(card.deckUsage * 10000) / 100}%</td>
							<td>{Math.round(card.gameUsage * 10000) / 100}%</td>
						</tr>
					)
				})}
			</table>
		)
	}

	let table
	if (!data) {table = <></>}
	else if (selectedEndpoint === 'decks') {
		table = parseDecks(data.body)
	} else if (selectedEndpoint === 'cards') {
		table = parseCards(data)
	}

	return (
		<>
			<MenuLayout
				back={() => setMenuSection('settings')}
				title="Hall of Fame"
				returnText="More"
				className={css.settingsMenu}
			>
				<div className={css.bigHallOfFameArea}>
					<div className={css.mainHallOfFameArea}>
						<h2> Hall of Fame </h2>
						<Dropdown
							button={<Button>{selectedEndpoint.charAt(0).toUpperCase() + selectedEndpoint.slice(1)}</Button>} // The things I do to make it look nice
							label="Select hall of fame endpoint"
							options={[
								{name: 'Decks', key: 'decks'},
								{name: 'Cards', key: 'cards'},
							]}
							showNames={true}
							action={(option) => {
								if (option === selectedEndpoint) return
								setData(null)
								setSelectedEndpoint(option as 'decks' | 'cards')
							}}
						/>
						<div className={css.tableArea}>{table}</div>
					</div>
				</div>
			</MenuLayout>
			{screenshotDeckModalContents !== null && (
				<ScreenshotDeckModal
					setOpen={screenshotDeckModalContents !== null}
					cards={screenshotDeckModalContents}
					onClose={() => setScreenshotDeckModalContents(null)}
				/>
			)}
		</>
	)
}

export default HallOfFame
