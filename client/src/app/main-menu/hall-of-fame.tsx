import {defaults} from 'chart.js'
import {CARDS} from 'common/cards'
import {getCardTypeIcon} from 'common/cards/card'
import {Card as CardType, isHermit, isItem} from 'common/cards/types'
import debugConfig from 'common/config/debug-config'
import serverConfig from 'common/config/server-config'
import {EXPANSIONS} from 'common/const/expansions'
import {TypeT} from 'common/types/cards'
import {WithoutFunctions} from 'common/types/server-requests'
import {sortCards} from 'common/utils/cards'
import {getIconPath} from 'common/utils/state-gen'
import Button from 'components/button'
import CardComponent from 'components/card'
import Checkbox from 'components/checkbox'
import Dropdown from 'components/dropdown'
import {ScreenshotDeckModal} from 'components/import-export'
import MenuLayout from 'components/menu-layout'
import Spinner from 'components/spinner'
import {localMessages} from 'logic/messages'
import {useRef, useState} from 'react'
import {Bar} from 'react-chartjs-2'
import {useDispatch} from 'react-redux'
import css from './main-menu.module.scss'

defaults.font = {size: 16, family: 'Minecraft, Unifont'}

const STATS_URL = `${debugConfig.statsUrl || window.location.origin}/api/stats`

defaults.font = {size: 16, family: 'Minecraft, Unifont'}
defaults.color = '#f8faff'
defaults.borderColor = '#585860'
defaults.aspectRatio = 1.75

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
	any: [255, 255, 255],
}

// Code modified from: https://stackoverflow.com/questions/28569667/fill-chart-js-bar-chart-with-diagonal-stripes-or-other-patterns
const createDiagonalPattern = (types: Array<string>) => {
	const color = getTypeColor(types)
	const backgroundColor = getTypeColor(types, 0.5)

	let shape = document.createElement('canvas')
	shape.width = 10
	shape.height = 10

	let canvas = shape.getContext('2d')
	if (!canvas) return null
	canvas.strokeStyle = color
	canvas.lineCap = 'square'
	canvas.lineWidth = 5

	canvas.fillStyle = backgroundColor
	canvas.fillRect(0, 0, 10, 10)

	canvas.beginPath()
	canvas.moveTo(0, 5)
	canvas.lineTo(5, 10)
	canvas.stroke()

	canvas.beginPath()
	canvas.moveTo(5, 0)
	canvas.lineTo(10, 5)
	canvas.stroke()

	return canvas.createPattern(shape, 'repeat')
}

const getTypeColor = (types: Array<string>, brightness: number = 1) => {
	let r = 0
	let g = 0
	let b = 0
	types.forEach((type) => {
		const color = TYPE_COLORS[type as TypeT]
		r += color[0] * brightness
		g += color[1] * brightness
		b += color[2] * brightness
	})
	return (
		'#' +
		Math.round(Math.min(255, r / types.length))
			.toString(16)
			.padStart(2, '0') +
		Math.round(Math.min(255, g / types.length))
			.toString(16)
			.padStart(2, '0') +
		Math.round(Math.min(255, b / types.length))
			.toString(16)
			.padStart(2, '0')
	)
}

type Props = {
	setMenuSection: (section: string) => void
}

type Endpoints = 'decks' | 'cards' | 'games' | 'types' | 'private game'

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
	const dispatch = useDispatch()

	const [screenshotDeckModalContents, setScreenshotDeckModalContents] =
		useState<Array<CardType> | null>(null)

	const [data, setData] = useState<any | null>(null)
	const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoints>('decks')
	const [showDisabled, setShowDisabled] = useState<boolean>(false)
	const [dataRetrieved, setDataRetrieved] = useState<boolean>(false)
	const [sortBy, setSortBy] = useState<'winrate' | 'frequency'>('winrate')

	/** Endpoint Options */
	const beforeRef = useRef<any>()
	const afterRef = useRef<any>()
	const [endpointBefore, setEndpointBefore] = useState<number | null>(null)
	const [endpointAfter, setEndpointAfter] = useState<number | null>(null)

	const [cardOrderBy, setCardOrderBy] =
		useState<keyof typeof cardOrderByOptions>('winrate')

	/**Decks */
	const [decksOrderyBy, setDecksOrderBy] =
		useState<keyof typeof decksOrderByOptions>('winrate')
	const [showDecksWithDisabled, setShowDecksWithDisabled] =
		useState<boolean>(false)
	const [showDecksBelow50Winrate, setShowDecksBelow50Winrate] =
		useState<boolean>(false)

	/* Types */
	const [showTypeWinrate, setShowTypeWinrate] = useState<boolean>(true)
	const [showTypeFrequency, setShowTypeFrequency] = useState<boolean>(true)

	/* Private Game */
	const codeRef = useRef<any>()
	const [privateGameCode, setPrivateGameCode] = useState<string | null>(null)

	const endpoints: Record<Endpoints, () => string> = {
		decks: () => {
			let url = `decks?minimumWins=25&orderBy=${decksOrderyBy}`
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
		games: () => {
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
			if (endpointBefore !== null && endpointAfter !== null) {
				return `type-distribution?after=${endpointAfter}&before=${endpointBefore}`
			}
			if (endpointBefore !== null) {
				return `type-distribution?before=${endpointBefore}`
			}
			if (endpointAfter !== null) {
				return `type-distribution?after=${endpointAfter}`
			}
			return 'type-distribution'
		},
		'private game': () => {
			if (!privateGameCode || privateGameCode.length !== 6) return ''
			return `private-game/${privateGameCode}`
		},
	}

	async function getData() {
		let url = `${STATS_URL}/${endpoints[selectedEndpoint]()}`
		try {
			const response = await fetch(url)
			if (!response.ok) {
				throw new Error(`Response status: ${response.status}`)
			}

			const json = await response.json()
			setData(json)
			setDataRetrieved(true)
		} catch (err) {
			console.error('Error loading data: ', err)
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

		if (!showDecksWithDisabled) {
			decks = decks.filter((deck) =>
				deck.deck.cards.every(
					(card: string) =>
						!(
							EXPANSIONS[CARDS[card].expansion].disabled ||
							serverConfig.limits.bannedCards.includes(card) ||
							serverConfig.limits.disabledCards.includes(card)
						),
				),
			)
		}

		if (!showDecksBelow50Winrate) {
			decks = decks.filter((deck) => deck.winrate >= 0.5)
		}

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
											sortCards(parseDeckCards(deck.deck.cards)),
										)
									}}
								>
									View
								</Button>
								<Button
									onClick={() => {
										navigator.clipboard.writeText(deck.deck.code)
										dispatch({
											type: localMessages.TOAST_OPEN,
											open: true,
											title: 'Hash copied!',
											description: `Copied ${deck.deck.code} to clipboard`,
											image: getIconPath(deck.deck),
										})
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
						serverConfig.limits.bannedCards.includes(card.id) ||
						serverConfig.limits.disabledCards.includes(card.id)
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
											<CardComponent
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
									<td>
										{card.winrate !== undefined
											? padDecimal(card.winrate, 2)
											: ''}
									</td>
								))}
							</tr>
							<tr>
								<th>Winrate vs Others</th>
								{cards.map((card) => (
									<td>
										{card.adjustedWinrate !== undefined
											? padDecimal(card.adjustedWinrate, 2)
											: ''}
									</td>
								))}
							</tr>
							<tr>
								<th>Winrate Difference</th>
								{cards.map((card) => (
									<td>
										{card.winrateDifference !== undefined
											? padDecimal(card.winrateDifference, 2)
											: ''}
									</td>
								))}
							</tr>
							<tr>
								<th>In % decks</th>
								{cards.map((card) => (
									<td>
										{card.deckUsage !== undefined
											? padDecimal(card.deckUsage, 2)
											: ''}
									</td>
								))}
							</tr>
							<tr>
								<th>Avg. copies</th>
								{cards.map((card) => (
									<td>
										{card.averageCopies !== undefined
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
							<tr>
								<th>Encounter Chance</th>
								{cards.map((card) => (
									<td>
										{card.encounterChance
											? padDecimal(card.encounterChance, 2)
											: ''}
									</td>
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
				{endpointAfter === null && endpointBefore === null && (
					<>
						<tr>
							<th>All time games</th>
							<td>{game.allTimeGames}</td>
						</tr>
						<tr>
							<th>Games since 1.0</th>
							<td>{game.games}</td>
						</tr>
					</>
				)}
				{(endpointAfter !== null || endpointBefore !== null) && (
					<tr>
						<th>Games</th>
						<td>{game.games}</td>
					</tr>
				)}
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

	const parsePrivateGame = (game: Record<string, any>) => {
		return (
			<table className={css.hallOfFameTableNoHeader}>
				<tr>
					<th>First Player</th>
					<td>{game.firstPlayerName}</td>
				</tr>
				<tr>
					<th>Second Player</th>
					<td>{game.secondPlayerName}</td>
				</tr>
				<tr>
					<th>Start Time</th>
					<td>{game.startTime}</td>
				</tr>
				<tr>
					<th>Winner</th>
					<td>{game.winner}</td>
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
			<div className={css.barContainer}>
				<Bar
					title={'Types sorted by ' + sortBy}
					className={css.typeGraph}
					data={{
						labels: typeList.map((type) => (type.type as string[]).join(', ')),
						datasets: [
							{
								label: 'Frequency',
								data: typeList.map(
									(type) => Math.round(type['frequency'] * 10000) / 100,
								),
								backgroundColor: typeList.map((value) => {
									const pattern = createDiagonalPattern(value.type)
									if (!pattern) return getTypeColor(value.type)
									return pattern
								}),
								borderColor: typeList.map((value) =>
									getTypeColor(value.type, 0.5),
								),
								borderWidth: 1,
								hidden: !showTypeFrequency,
							},
							{
								label: 'Winrate',
								data: typeList.map(
									(type) => Math.round(type['winrate'] * 10000) / 100,
								),
								backgroundColor: typeList.map((value) =>
									getTypeColor(value.type),
								),
								hidden: !showTypeWinrate,
							},
						],
					}}
					options={{
						animation: {
							duration: 0,
						},
						plugins: {
							legend: {
								onClick: () => {},
							},
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
						scales: {
							x: {
								ticks: {
									display: false,
								},
							},
							y: {
								min: 0,
								ticks: {
									callback: function (value, _index, _values) {
										return value + '%'
									},
								},
							},
						},
						layout: {
							padding: {
								/* Each type icon needs twenty pixels of padding */
								bottom: Math.max(...typeList.map((x) => x.type.length)) * 20,
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
			</div>
		)
	}

	const getTable = () => {
		if (!data) {
			return <></>
		} else if (selectedEndpoint === 'decks') {
			return parseDecks(data.body)
		} else if (selectedEndpoint === 'cards') {
			return parseCards(data)
		} else if (selectedEndpoint === 'games') {
			return parseGame(data)
		} else if (selectedEndpoint === 'types') {
			return parseTypes(data)
		} else if (selectedEndpoint === 'private game') {
			return parsePrivateGame(data)
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
										{name: 'Games'},
										{name: 'Types'},
										{name: 'Private game'},
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
								{selectedEndpoint !== 'private game' && (
									<>
										<div className={css.hofOption}>
											<p style={{flexGrow: 1}}>After:</p>
											<input
												type="date"
												ref={afterRef}
												onChange={(_e) => {
													if (!afterRef.current.valueAsNumber) {
														setEndpointAfter(null)
													} else {
														setEndpointAfter(
															afterRef.current.valueAsNumber / 1000,
														)
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
									</>
								)}
								{selectedEndpoint === 'decks' && (
									<>
										<div className={css.hofOption}>
											<p style={{flexGrow: 1}}>Sort By:</p>
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
										<div className={css.hofCheckBox}>
											<p style={{flexGrow: 1}}>
												Show decks that include disabled cards:
											</p>
											<Checkbox
												defaultChecked={showDecksWithDisabled}
												onCheck={() =>
													setShowDecksWithDisabled(!showDecksWithDisabled)
												}
											></Checkbox>
										</div>
										<div className={css.hofCheckBox}>
											<p style={{flexGrow: 1}}>
												Show decks below a 50% winrate:
											</p>
											<Checkbox
												defaultChecked={showDecksBelow50Winrate}
												onCheck={() =>
													setShowDecksBelow50Winrate(!showDecksBelow50Winrate)
												}
											></Checkbox>
										</div>
									</>
								)}
								{selectedEndpoint === 'cards' && (
									<>
										<div className={css.hofOption}>
											<p style={{flexGrow: 1}}>Sort By:</p>
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
										<div className={css.hofCheckBox}>
											<p style={{flexGrow: 1}}>Show Disabled Cards:</p>
											<Checkbox
												defaultChecked={showDisabled}
												onCheck={() => setShowDisabled(!showDisabled)}
											></Checkbox>
										</div>
									</>
								)}
								{selectedEndpoint === 'types' && (
									<>
										<Button
											onClick={() => {
												setSortBy(
													sortBy === 'winrate' ? 'frequency' : 'winrate',
												)
												setDataRetrieved(false)
											}}
										>
											Sort by:{' '}
											{sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
										</Button>
										<div className={css.hofCheckBox}>
											<p style={{flexGrow: 1}}>Show Frequency:</p>
											<Checkbox
												defaultChecked={showTypeFrequency}
												onCheck={() => setShowTypeFrequency(!showTypeFrequency)}
											></Checkbox>
										</div>
										<div className={css.hofCheckBox}>
											<p style={{flexGrow: 1}}>Show Winrate:</p>
											<Checkbox
												defaultChecked={showTypeWinrate}
												onCheck={() => setShowTypeWinrate(!showTypeWinrate)}
											></Checkbox>
										</div>
									</>
								)}
								{selectedEndpoint === 'private game' && (
									<input
										type="text"
										ref={codeRef}
										value={privateGameCode ? privateGameCode : ''}
										onChange={(e) => {
											setPrivateGameCode(e.target.value)
										}}
										maxLength={7}
										placeholder="Enter Game Code..."
										className={css.input}
										data-focused={true}
									/>
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
