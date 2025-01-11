import {CARDS} from 'common/cards'
import {Card as CardType, isHermit, isItem} from 'common/cards/types'
import serverConfig from 'common/config/server-config'
import {EXPANSIONS} from 'common/const/expansions'
import {WithoutFunctions} from 'common/types/server-requests'
import Button from 'components/button'
import Card from 'components/card'
import Checkbox from 'components/checkbox'
import Dropdown from 'components/dropdown'
import {ScreenshotDeckModal} from 'components/import-export'
import MenuLayout from 'components/menu-layout'
import Spinner from 'components/spinner'
import {useRef, useState} from 'react'
import css from './main-menu.module.scss'

type Props = {
	setMenuSection: (section: string) => void
}

type Endpoints = 'decks' | 'cards' | 'game'

const cardOrderByOptions = {
	winrate: 'Winrate',
	deckUsage: 'Deck Usage',
	gameUsage: 'Game Usage',
	averageCopies: 'Average Copies',
	averagePlayers: 'Average Players',
	encounterChance: 'Encounter Chance',
	adjustedWinrate: 'Adjusted Winrate',
	winrateDifference: 'Winrate Difference',
}

function padDecimal(n: number, paddingAmount: number) {
	const percent = Math.round(n * 10000) / 100
	let percentString = percent.toString()
	if (!percentString.includes('.')) percentString += '.'

	const [beforeDecimal, afterDecimal] = percentString.split('.')

	return `${beforeDecimal}.${afterDecimal.padEnd(paddingAmount, '0')}%`
}

function title(s: string) {
	return s.charAt(0).toLocaleUpperCase() + s.slice(1).toLocaleLowerCase()
}

function DropDownButton({children}: {children: React.ReactChild}) {
	return <Button>{children} ▼</Button>
}

function HallOfFame({setMenuSection}: Props) {
	const [screenshotDeckModalContents, setScreenshotDeckModalContents] =
		useState<Array<CardType> | null>(null)

	const [data, setData] = useState<any | null>(null)
	const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoints>('decks')
	const [showDisabled, setShowAdvent] = useState<boolean>(false)
	const [dataRetrieved, setDataRetrieved] = useState<boolean>(false)

	/** Endpoint Options */
	const beforeRef = useRef<any>()
	const afterRef = useRef<any>()

	const [endpointBefore, setEndpointBefore] = useState<number | null>(null)
	const [endpointAfter, setEndpointAfter] = useState<number | null>(null)
	const [cardOrderBy, setCardOrderBy] =
		useState<keyof typeof cardOrderByOptions>('winrate')

	const endpoints: Record<Endpoints, () => string> = {
		decks: () => {
			let url = 'decks?minimumWins=10&orderBy=winrate'
			if (endpointBefore !== null) {
				url += `&before=${endpointBefore}`
			}
			if (endpointAfter !== null) {
				url += `&after=${endpointAfter}`
			}
			return url
		},
		cards: () => {
			let url = `cards?orderBy=${cardOrderBy}`
			if (endpointBefore !== null) {
				url += `&before=${endpointBefore}`
			}
			if (endpointAfter !== null) {
				url += `&after=${endpointAfter}`
			}
			return url
		},
		game: () => {
			let url = 'games'
			if (endpointBefore !== null) {
				url += `&before=${endpointBefore}`
			}
			if (endpointAfter !== null) {
				url += `&after=${endpointAfter}`
			}
			return url
		},
	}

	async function getData() {
		const url = `https://hc-tcg.online/api/stats/${endpoints[selectedEndpoint]()}`

		console.log(url)

		try {
			const response = await fetch(url)
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`)
			}

			const json = await response.json()
			setData(json)
			setDataRetrieved(true)
		} catch (err) {
			console.error('Chat error: ', err)
		}
	}

	if (!dataRetrieved) getData()

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
		if (!decks) return
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

		const cardGroups = cards.reduce(
			(r: Array<Array<Record<string, any>>>, card, index) => {
				if (index % 9 === 0) {
					r.push([])
				}
				r[r.length - 1].push(card)
				if (index === cards.length - 1) {
					for (let i = (index % 9) + 1; i < 9; i++) {
						r[r.length - 1].push({extraCard: null})
					}
				}
				return r
			},
			[],
		)

		console.log(cardGroups)

		return (
			<div>
				{cardGroups.map((cardGroup) => {
					const cards = cardGroup
					const cardObjects = cards.map((card) => {
						const cardObject = CARDS[card.id]
						if (!cardObject) return null
						return cardObject
					})
					return (
						<table className={css.hallOfFameTableGrid}>
							<tr>
								<th></th>
								{cardObjects.map((card, index) => {
									if (!card) return <td key={index}></td>
									return (
										<td key={index}>
											<Card
												displayTokenCost={false}
												card={card as WithoutFunctions<CardType>}
											/>
										</td>
									)
								})}
							</tr>
							<tr>
								<th>Winrate</th>
								{cards.map((card) => (
									<td>{card.winrate ? padDecimal(card.winrate, 2) : ''}</td>
								))}
							</tr>
							<tr>
								<th>In % decks</th>
								{cards.map((card) => (
									<td>{card.deckUsage ? padDecimal(card.deckUsage, 2) : ''}</td>
								))}
							</tr>
							<tr>
								<th>Avg. copies</th>
								{cards.map((card) => (
									<td>
										{card.averageCopies
											? Math.round(card.averageCopies * 100) / 100
											: ''}
									</td>
								))}
							</tr>
							<tr>
								<th>In % games</th>
								{cards.map((card) => (
									<td>{card.gameUsage ? padDecimal(card.gameUsage, 2) : ''}</td>
								))}
							</tr>
						</table>
					)
				})}
			</div>
		)
	}

	const formatTime = (time: Record<string, number>) => {
		return `${time.minutes}:${time.seconds}.${Math.round(time.milliseconds)}`
	}

	const parseGame = (game: Record<string, any>) => {
		return (
			<table className={css.hallOfFameTableNoHeader}>
				<tr>
					<th>All time games</th>
					<td>{game.allTimeGames}</td>
				</tr>
				<tr>
					<th>Games since 1.0</th>
					<td>{game.games}</td>
				</tr>
				<tr>
					<th>Tie rate</th>
					<td>{padDecimal(game.tieRate, 3)}</td>
				</tr>
				<tr>
					<th>Forfeit rate</th>
					<td>{padDecimal(game.forfeitRate, 3)}</td>
				</tr>
				<tr>
					<th>Error rate</th>
					<td>{padDecimal(game.errorRate, 3)}</td>
				</tr>
				<tr>
					<th>Average game length</th>
					<td>{formatTime(game.gameLength.averageLength)}</td>
				</tr>
				<tr>
					<th>Median game length</th>
					<td>{formatTime(game.gameLength.medianLength)}</td>
				</tr>
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
		} else if (selectedEndpoint === 'game') {
			return parseGame(data)
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
						<div className={css.tableArea}>
							{dataRetrieved && getTable()}
							{!dataRetrieved && (
								<div className={css.loadingIndicator}>
									<Spinner></Spinner>
									Loading...
								</div>
							)}
						</div>
						<div className={css.hofSidebar}>
							<div className={css.hallOfFameHeader}>Hall of Fame</div>
							<div className={css.hofOptions}>
								<p>
									<b>Statistic</b>
								</p>
								<Dropdown
									button={
										<DropDownButton>{title(selectedEndpoint)}</DropDownButton>
									}
									label="Selected statistic"
									options={[{name: 'Decks'}, {name: 'Cards'}, {name: 'Game'}]}
									showNames={true}
									action={(option) => {
										if (option === selectedEndpoint) return
										setData(null)
										setDataRetrieved(false)
										setSelectedEndpoint(option.toLocaleLowerCase() as Endpoints)
									}}
								/>
								<p>
									<b>Parameters</b>
								</p>
								<div className={css.hofOption}>
									<p style={{flexGrow: 1}}>After:</p>
									<input
										type="date"
										ref={afterRef}
										onChange={(_e) => {
											setEndpointAfter(afterRef.current.valueAsNumber / 1000)
											setDataRetrieved(false)
										}}
									/>
								</div>
								<div className={css.hofOption}>
									<p style={{flexGrow: 1}}>Before:</p>
									<input
										type="date"
										ref={beforeRef}
										onChange={(_e) => {
											setEndpointBefore(beforeRef.current.valueAsNumber / 1000)
											setDataRetrieved(false)
										}}
									/>
								</div>
								{selectedEndpoint === 'cards' && (
									<div className={css.hofCheckBox}>
										<p style={{flexGrow: 1}}>Show Disabled Cards:</p>
										<Checkbox
											defaultChecked={showDisabled}
											onCheck={() => setShowAdvent(!showDisabled)}
										></Checkbox>
									</div>
								)}
								{selectedEndpoint === 'cards' && (
									<div className={css.hofOption}>
										<p style={{flexGrow: 1}}>Order By:</p>
										<Dropdown
											button={
												<DropDownButton>
													{cardOrderByOptions[cardOrderBy]}
												</DropDownButton>
											}
											label="Order By"
											options={Object.entries(cardOrderByOptions).map(
												([k, v]) => ({
													name: v,
													key: k,
												}),
											)}
											showNames={true}
											action={(option) => {
												setDataRetrieved(false)
												setCardOrderBy(
													option as keyof typeof cardOrderByOptions,
												)
											}}
										/>
									</div>
								)}
							</div>
						</div>
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
