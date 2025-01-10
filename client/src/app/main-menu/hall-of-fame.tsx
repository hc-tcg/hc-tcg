import {CARDS} from 'common/cards'
import {Card, isHermit, isItem} from 'common/cards/types'
import Button from 'components/button'
import {ScreenshotDeckModal} from 'components/import-export'
import MenuLayout from 'components/menu-layout'
import {useMessageDispatch} from 'logic/messages'
import {useState} from 'react'
import css from './main-menu.module.scss'
import Dropdown from 'components/dropdown'
import {EXPANSIONS} from 'common/const/expansions'
import serverConfig from 'common/config/server-config'

type Props = {
	setMenuSection: (section: string) => void
}

type Endpoints = 'decks' | 'cards'

function padDecimal(n: number, paddingAmount: number) {
	const percent = Math.round(n * 10000) / 100
	let percentString = percent.toString()
	if (!percentString.includes('.')) percentString += '.'

	const [beforeDecimal, afterDecimal] = percentString.split('.')

	return `${beforeDecimal}.${afterDecimal.padEnd(paddingAmount, '0')}%`
}

function HallOfFame({setMenuSection}: Props) {
	const dispatch = useMessageDispatch()

	const [screenshotDeckModalContents, setScreenshotDeckModalContents] =
		useState<Array<Card> | null>(null)

	const [data, setData] = useState<any | null>(null)
	const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoints>('decks')
	const [showDisabled, setShowAdvent] = useState<boolean>(false)

	const endpoints = {
		decks: 'decks?minimumWins=10&orderBy=winrate',
		cards: 'cards',
	}

	async function getData() {
		const url = `https://hc-tcg.online/api/stats/${endpoints[selectedEndpoint]}`
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
							<td>{padDecimal(deck.winrate, 2)}</td>
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
		if (!showDisabled) {
			cards = cards.filter(
				(card) =>
					!(
						EXPANSIONS[CARDS[card.id].expansion].disabled ||
						serverConfig.limits.bannedCards.includes(card.id)
					),
			)
		}

		return (
			<table className={css.hallOfFameTable}>
				<tr>
					<th>Card Id</th>
					<th>Winrate</th>
					<th>in % decks</th>
					<th>in % games</th>
				</tr>
				{cards.map((card) => {
					return (
						<tr key={card.id}>
							<td>{card.id}</td>
							<td>{padDecimal(card.winrate, 2)}</td>
							<td>{padDecimal(card.deckUsage, 2)}</td>
							<td>{padDecimal(card.gameUsage, 2)}</td>
						</tr>
					)
				})}
			</table>
		)
	}

	const getTable = () => {
		if (!data) {
			return <></>
		} else if (selectedEndpoint === 'decks') {
			return parseDecks(data.body)
		} else if (selectedEndpoint === 'cards') {
			return parseCards(data)
		}
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
						<div className={css.hofOptions}>
							<Dropdown
								button={
									<Button>
										{selectedEndpoint.charAt(0).toUpperCase() +
											selectedEndpoint.slice(1)}
									</Button>
								} // The things I do to make it look nice
								label="Select hall of fame endpoint"
								options={[
									{name: 'Decks', key: 'decks'},
									{name: 'Cards', key: 'cards'},
								]}
								showNames={true}
								action={(option) => {
									if (option === selectedEndpoint) return
									setData(null)
									setSelectedEndpoint(option as Endpoints)
								}}
							/>
							{selectedEndpoint === 'cards' && (
								<Button onClick={() => setShowAdvent(!showDisabled)}>
									Show Disabled Cards: {showDisabled ? 'Yes' : 'No'}
								</Button>
							)}
						</div>
						<div className={css.tableArea}>{getTable()}</div>
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
