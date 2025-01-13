import {defaults} from 'chart.js'
import {CARDS} from 'common/cards'
import {getCardTypeIcon} from 'common/cards/card'
import {Card as CardType, isHermit, isItem} from 'common/cards/types'
import serverConfig from 'common/config/server-config'
import {EXPANSIONS} from 'common/const/expansions'
import {TypeT} from 'common/types/cards'
import {WithoutFunctions} from 'common/types/server-requests'
import Button from 'components/button'
import Card from 'components/card'
import Checkbox from 'components/checkbox'
import Dropdown from 'components/dropdown'
import {ScreenshotDeckModal} from 'components/import-export'
import MenuLayout from 'components/menu-layout'
import Spinner from 'components/spinner'
import {useRef, useState} from 'react'
import {Bar} from 'react-chartjs-2'
import css from './main-menu.module.scss'

defaults.font = {size: 16, family: 'Minecraft, Unifont'}

const TYPE_COLORS: Record<TypeT, Array<number>> = {
	farm: [124, 204, 12],
	redstone: [185, 33, 42],
	prankster: [116, 55, 168],
	explorer: [103, 138, 190],
	balanced: [101, 124, 50],
	builder: [184, 162, 154],
	pvp: [85, 202, 194],
	speedrunner: [223, 226, 36],
	terraform: [217, 119, 147],
	miner: [110, 105, 108],
	any: [0, 0, 0],
}

const getTypeColor = (types: Array<string>) => {
	let r = 0
	let g = 0
	let b = 0
	types.forEach((type) => {
		const color = TYPE_COLORS[type as TypeT]
		r += color[0]
		g += color[1]
		b += color[2]
	})
	return (
		'#' +
		Math.round(r / types.length).toString(16) +
		Math.round(g / types.length).toString(16) +
		Math.round(b / types.length).toString(16)
	)
}

type Props = {
	setMenuSection: (section: string) => void
}

type Endpoints = 'decks' | 'cards' | 'game' | 'types'

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

const decksOrderByOptions = {
	winrate: 'Winrate',
	wins: 'Wins',
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
	const [sortBy, setSortBy] = useState<'winrate' | 'frequency'>('winrate')

	/** Endpoint Options */
	const beforeRef = useRef<any>()
	const afterRef = useRef<any>()
	const [endpointBefore, setEndpointBefore] = useState<number | null>(null)
	const [endpointAfter, setEndpointAfter] = useState<number | null>(null)

	const [cardOrderBy, setCardOrderBy] =
		useState<keyof typeof cardOrderByOptions>('winrate')

	const [decksOrderyBy, setDecksOrderBy] =
		useState<keyof typeof decksOrderByOptions>('winrate')

	const endpoints: Record<Endpoints, () => string> = {
		decks: () => {
			let url = `decks?minimumWins=10&orderBy=${decksOrderyBy}`
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
			if (endpointBefore !== null && endpointAfter !== null) {
				return `games?after=${endpointAfter}&before=${endpointBefore}`
			}
			if (endpointBefore !== null) {
				return `games?before=${endpointBefore}`
			}
			if (endpointAfter !== null) {
				return `games?after=${endpointAfter}`
			}

			return 'games'
		},
		types: () => {
			let url = 'type-distribution'
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
							<td>{deck.losses}</td>
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

	const parseTypes = (
		types: Record<string, number | Array<Record<string, any>>>,
	) => {
		const typeList = types.types as Array<Record<string, any>>
		typeList.sort((a, b) => b[sortBy] - a[sortBy])

		return (
			<Bar
				title={'Types sorted by ' + sortBy}
				className={css.typeGraph}
				data={{
					// @TODO: This is pretty hacky, it extends the bottom of the chart to ensure the images fit
					labels: typeList.map((_type) => '     '),
					datasets: [
						{
							label: 'Types sorted by ' + sortBy,
							data: typeList.map(
								(type) => Math.round(type[sortBy] * 10000) / 100,
							),
							backgroundColor: typeList.map((value) =>
								getTypeColor(value.type),
							),
						},
					],
				}}
				options={{
					animation: {
						duration: 0,
					},
					plugins: {
						tooltip: {
							titleFont: () => {
								return {size: 16}
							},
							bodyFont: () => {
								return {size: 12}
							},
							backgroundColor: 'rgba(10, 1, 15, 0.95)',
							borderWidth: 2,
							borderColor: 'rgb(38, 13, 77)',
							callbacks: {
								title: (item) => item[0].formattedValue + '%',
								label: (item) =>
									typeList[item.dataIndex].type.map(title).join(', '),
							},
						},
					},
				}}
				plugins={[
					{
						id: 'iconDrawer',
						afterDatasetsDraw: (chart) => {
							const ctx = chart.ctx
							const xAxis = chart.scales.x
							const offset =
								(xAxis.getPixelForTick(1) - xAxis.getPixelForTick(0)) / 2
							xAxis.ticks.forEach((_value, index: number) => {
								const x = xAxis.getPixelForTick(index) - offset + 10
								typeList[index].type.forEach((type: TypeT, index: number) => {
									const image = new Image()
									image.src = getCardTypeIcon(type)
									ctx.drawImage(
										image,
										x,
										chart.scales.y.bottom + 5 + index * 20,
										20,
										20,
									)
								})
							})
						},
					},
				]}
			/>
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
		} else if (selectedEndpoint === 'types') {
			return parseTypes(data)
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
									options={[
										{name: 'Decks'},
										{name: 'Cards'},
										{name: 'Game'},
										{name: 'Types'},
									]}
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
											if (!afterRef.current.valueAsNumber) {
												setEndpointAfter(null)
											} else {
												setEndpointAfter(afterRef.current.valueAsNumber / 1000)
											}
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
											if (!beforeRef.current.valueAsNumber) {
												setEndpointBefore(null)
											} else {
												setEndpointBefore(
													beforeRef.current.valueAsNumber / 1000,
												)
											}
											setDataRetrieved(false)
										}}
									/>
								</div>
								{selectedEndpoint === 'decks' && (
									<>
										<div className={css.hofOption}>
											<p style={{flexGrow: 1}}>Order By:</p>
											<Dropdown
												button={
													<DropDownButton>
														{decksOrderByOptions[decksOrderyBy]}
													</DropDownButton>
												}
												label="Order By"
												options={Object.entries(decksOrderByOptions).map(
													([k, v]) => ({
														name: v,
														key: k,
													}),
												)}
												showNames={true}
												action={(option) => {
													setDataRetrieved(false)
													setDecksOrderBy(
														option as keyof typeof decksOrderByOptions,
													)
												}}
											/>
										</div>
									</>
								)}
								{selectedEndpoint === 'cards' && (
									<>
										<div className={css.hofCheckBox}>
											<p style={{flexGrow: 1}}>Show Disabled Cards:</p>
											<Checkbox
												defaultChecked={showDisabled}
												onCheck={() => setShowAdvent(!showDisabled)}
											></Checkbox>
										</div>
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
									</>
								)}
								{selectedEndpoint === 'types' && (
									<Button
										onClick={() => {
											setSortBy(sortBy === 'winrate' ? 'frequency' : 'winrate')
											setDataRetrieved(false)
										}}
									>
										Sort by: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
									</Button>
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
