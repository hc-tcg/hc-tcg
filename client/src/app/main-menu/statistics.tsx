import {defaults} from 'chart.js'
import classNames from 'classnames'
import {CARDS} from 'common/cards'
import {getCardTypeIcon} from 'common/cards/card'
import {Card as CardType} from 'common/cards/types'
import debugConfig from 'common/config/debug-config'
import serverConfig from 'common/config/server-config'
import {EXPANSIONS} from 'common/const/expansions'
import {TypeT} from 'common/types/cards'
import {GameHistory} from 'common/types/database'
import {Tag} from 'common/types/deck'
import {WithoutFunctions} from 'common/types/server-requests'
import {sortCards} from 'common/utils/cards'
import {getDeckTypes, parseDeckCards} from 'common/utils/decks'
import Button from 'components/button'
import CardComponent from 'components/card'
import Checkbox from 'components/checkbox'
import Dropdown from 'components/dropdown'
import {FormattedText} from 'components/formatting/formatting'
import {ScreenshotDeckModal} from 'components/import-export'
import MenuLayout from 'components/menu-layout'
import {Modal} from 'components/modal'
import Spinner from 'components/spinner'
import Tabs from 'components/tabs/tabs'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages} from 'logic/messages'
import {ReactNode, useEffect, useReducer, useRef, useState} from 'react'
import {Bar} from 'react-chartjs-2'
import {useDispatch, useSelector} from 'react-redux'
import {FilterComponent} from '../deck/deck-select'
import css from './statistics.module.scss'

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
	anarchist: [180, 167, 214],
	athlete: [0, 0, 255],
	bard: [255, 217, 102],
	challenger: [67, 67, 67],
	collector: [204, 65, 37],
	diplomat: [28, 69, 135],
	historian: [152, 0, 0],
	inventor: [217, 217, 217],
	looper: [60, 210, 216],
	pacifist: [255, 255, 255],
	scavenger: [120, 63, 4],
	any: [25, 25, 25],
	everything: [25, 25, 25],
	mob: [25, 25, 25],
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

function formatDivision(
	numerator: number,
	denominator: number,
	paddingAmount: number,
) {
	if (denominator === 0) return 'N/A'
	return padDecimal(numerator / denominator, paddingAmount)
}

function title(s: string) {
	return s.charAt(0).toLocaleUpperCase() + s.slice(1).toLocaleLowerCase()
}

function DropDownButton({children}: {children: React.ReactChild}) {
	return <Button>{children} ▼</Button>
}

function Statistics({setMenuSection}: Props) {
	const dispatch = useDispatch()

	// Stats stuff
	const databaseInfo = useSelector(getLocalDatabaseInfo)
	const stats = databaseInfo.stats
	const gameHistory = databaseInfo.gameHistory
	const settings = useSelector(getSettings)
	const [tab, setTab] = useState<string>('Statistics')
	const [showInvalidReplayModal, setShowInvalidReplayModal] =
		useState<boolean>(false)
	const [showOverviewModal, setShowOverviewModal] = useState<boolean>(false)
	const [showReplayModal, setShowReplayModal] = useState<boolean>(false)
	const [currentGame, setCurrentGame] = useState<GameHistory | null>(null)

	const [filteredGames, setFilteredGames] =
		useState<Array<GameHistory>>(gameHistory)
	const [tagFilter, setTagFilter] = useState<Tag | null>(null)
	const [typeFilter, setTypeFilter] = useState<string>('')
	const [nameFilter, setNameFilter] = useState<string>('')
	const [opponentNameFilter, setOpponentNameFilter] = useState<string>('')

	function filterGames(
		games: Array<GameHistory>,
		d?: {
			tag?: string | null
			type?: string
			name?: string
			opponentName?: string
		},
	): Array<GameHistory> {
		const compareTag = d && d.tag === null ? null : (d && d.tag) || tagFilter
		const compareType = (d && d.type) || typeFilter
		const compareName = d && d.name !== undefined ? d.name : nameFilter
		const compareOpponentName =
			d && d.opponentName !== undefined ? d.opponentName : opponentNameFilter

		return games.filter((game) => {
			const otherPlayer =
				game.firstPlayer.uuid === databaseInfo.userId
					? game.secondPlayer
					: game.firstPlayer
			return (
				(!compareTag ||
					game.usedDeck.tags?.find((tag) => tag.key === compareTag)) &&
				(!compareType ||
					compareType === 'any' ||
					getDeckTypes(
						game.usedDeck.cards.map((card) => card.props.id),
					).includes(compareType)) &&
				(!compareName ||
					compareName === '' ||
					game.usedDeck.name
						.toLocaleLowerCase()
						.includes(compareName.toLocaleLowerCase())) &&
				(!compareOpponentName ||
					compareOpponentName === '' ||
					otherPlayer.name
						.toLocaleLowerCase()
						.includes(compareOpponentName.toLocaleLowerCase()))
			)
		})
	}

	const opponentNameFilterAction = (name: string) => {
		if (name === '') {
			setOpponentNameFilter('')
			setFilteredGames(filterGames(gameHistory, {opponentName: name}))
			return
		}
		setOpponentNameFilter(name)
		setFilteredGames(filterGames(gameHistory, {opponentName: name}))
	}

	const handleReplayGame = (game: GameHistory) => {
		setShowReplayModal(true)
		setCurrentGame(game)
		dispatch({
			type: localMessages.MATCHMAKING_REPLAY_GAME,
			id: game.id,
		})
	}
	const handleOverview = (game: GameHistory) => {
		setShowOverviewModal(true)
		setCurrentGame(game)
		dispatch({
			type: localMessages.OVERVIEW,
			id: game.id,
		})
	}

	const invalidReplay = databaseInfo.invalidReplay
	const overview = databaseInfo.replayOverview
	const overviewFirstId = overview.length >= 1 ? overview[0].sender.id : ''

	if (invalidReplay && !showInvalidReplayModal) {
		setShowOverviewModal(false)
		setShowReplayModal(false)
		setShowInvalidReplayModal(true)
	}

	// Hall of fame stuff
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
	const [showDropdown, setShowDropdown] = useState<boolean>(false)
	const [showGameFilters, setShowGameFilters] = useState<boolean>(false)

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

	// Make sure things look good after resize
	const [, inc] = useReducer((x) => x + 1, 0)
	useEffect(() => {
		window.addEventListener('resize', inc)

		// Clean up event listeners
		return () => {
			window.removeEventListener('resize', inc)
		}
	})

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
		if (tab !== 'Hall of Fame') return
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
											image: 'copy',
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

		const cardsPerLine = window.innerWidth > 720 ? 9 : 5

		const cardGroups = cards.reduce(
			(r: Array<Array<Record<string, any>>>, card, index) => {
				if (index % cardsPerLine === 0) {
					r.push([])
				}
				r[r.length - 1].push(card)
				if (index === cards.length - 1) {
					for (let i = (index % cardsPerLine) + 1; i < cardsPerLine; i++) {
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
					<td>
						{game.gameLength && formatTime(game.gameLength.averageLength)}
					</td>
				</tr>
				<tr>
					<th>Median game length</th>
					<td>{game.gameLength && formatTime(game.gameLength.medianLength)}</td>
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

		const onMobile = window.innerWidth > 720 ? false : true

		const xTicks = {
			ticks: {
				display: false,
			},
		}
		const yTicks = {
			min: 0,
			ticks: {
				callback: function (value: any) {
					return value + '%'
				},
			},
		}

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
						indexAxis: onMobile ? 'y' : 'x',
						responsive: true,
						animation: {
							duration: 0,
						},
						maintainAspectRatio: false,
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
							x: onMobile ? yTicks : xTicks,
							y: onMobile ? xTicks : xTicks,
						},
						layout: {
							padding: {
								/* Each type icon needs twenty pixels of padding */
								bottom: onMobile
									? 0
									: Math.max(...typeList.map((x) => x.type.length)) * 20,
								left: onMobile ? 40 : 0,
							},
						},
					}}
					plugins={[
						{
							id: 'iconDrawer',
							afterDatasetsDraw: (chart) => {
								const ctx = chart.ctx
								const xAxis = chart.scales.x
								const yAxis = chart.scales.y
								if (!onMobile) {
									const offset =
										(xAxis.getPixelForTick(1) - xAxis.getPixelForTick(0)) / 2
									xAxis.ticks.forEach((_value, index: number) => {
										const x = xAxis.getPixelForTick(index) - offset + 10
										typeList[index].type.forEach(
											(type: TypeT, index: number) => {
												const image = new Image()
												image.src = getCardTypeIcon(type)
												ctx.drawImage(
													image,
													x,
													chart.scales.y.bottom + 5 + index * 20,
													20,
													20,
												)
											},
										)
									})
								} else {
									const offset =
										(yAxis.getPixelForTick(1) - yAxis.getPixelForTick(0)) / 2
									yAxis.ticks.forEach((_value, index: number) => {
										const y = yAxis.getPixelForTick(index) - offset + 10
										typeList[index].type.forEach((type: TypeT, i: number) => {
											if (i >= 2) return
											const image = new Image()
											if (typeList[index].type.length > 2 && i === 1) {
												image.src = '/images/icons/plus.png'
											} else {
												image.src = getCardTypeIcon(type)
											}
											ctx.drawImage(image, 20 - i * 20, y, 20, 20)
										})
									})
								}
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

	const DropdownComponent = ({button}: {button: ReactNode}) => {
		return (
			<Dropdown
				button={button}
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
		)
	}

	const filteredGamesHtml = filteredGames.map((game) => {
		const startTime = new Date(game.startTime)
		return (
			<div className={css.gameHistoryBox}>
				<div
					className={classNames(
						css.gameAreaMiddle,
						settings.gameSide === 'Right' && css.reverseSide,
					)}
				>
					<div id={css.playerHead}>
						<div className={css.playerHead}>
							<img
								src={`https://mc-heads.net/head/${game.firstPlayer.player === 'opponent' ? game.secondPlayer.minecraftName : game.firstPlayer.minecraftName}/right`}
								alt="player head"
							/>
						</div>
					</div>
					<div id={css.opponentHead}>
						<div className={css.playerHead}>
							<img
								src={`https://mc-heads.net/head/${game.secondPlayer.player === 'opponent' ? game.secondPlayer.minecraftName : game.firstPlayer.minecraftName}/left`}
								alt="player head"
							/>
						</div>
					</div>
					<div
						className={classNames(
							css.playerName,
							settings.gameSide === 'Right' && css.reverseSide,
							game.firstPlayer.uuid === databaseInfo.userId && css.me,
						)}
					>
						{game.firstPlayer.uuid === game.winner && (
							<img src={'images/icons/trophy.png'} className={css.trophy} />
						)}
						{game.firstPlayer.name}
					</div>
					<div
						className={classNames(
							css.winAndLoss,
							settings.gameSide === 'Right' && css.reverseSide,
						)}
					>
						<div
							className={classNames(
								game.winner === databaseInfo.userId && css.win,
								game.winner !== databaseInfo.userId && css.loss,
								css.me,
							)}
						>
							{game.winner === databaseInfo.userId ? 'W' : 'L'}
						</div>{' '}
						<div className={css.dash}>-</div>{' '}
						<div>{game.winner === databaseInfo.userId ? 'L' : 'W'}</div>
					</div>
					<div
						className={classNames(
							css.playerName,
							settings.gameSide === 'Right' && css.reverseSide,
							game.secondPlayer.uuid === databaseInfo.userId && css.me,
						)}
					>
						{game.secondPlayer.uuid === game.winner && (
							<img src={'images/icons/trophy.png'} className={css.trophy} />
						)}
						{game.secondPlayer.name}
					</div>
					<Button
						id={css.deck}
						onClick={() => {
							setScreenshotDeckModalContents(
								sortCards(
									parseDeckCards(
										game.usedDeck.cards.map((card) => card.props.id),
									),
								),
							)
						}}
					>
						View Deck
					</Button>
					{game.hasReplay && (
						<Button id={css.replay} onClick={() => handleReplayGame(game)}>
							Watch Replay
						</Button>
					)}
					{game.hasReplay && (
						<Button id={css.overview} onClick={() => handleOverview(game)}>
							Overview
						</Button>
					)}
					<div id={css.time} className={css.timeAndturns}>
						{startTime.getMonth() + 1}/{startTime.getDate()}
						<span className={css.hideOnMobile}>
							/{startTime.getFullYear() - 2000},{' '}
						</span>
						<span>
							{startTime.getHours() % 12}:
							{startTime.getMinutes().toString().padStart(2, '0')}{' '}
							{startTime.getHours() >= 12 ? 'PM' : 'AM'}
						</span>
					</div>
					<div id={css.turns} className={css.hideOnMobile}>
						{game.length.minutes}m{game.length.seconds}.
						{Math.floor(game.length.milliseconds / 10)}s | {game.turns} Turn
						{game.turns !== 1 && 's'}
					</div>
					<div
						id={css.turns}
						className={classNames(css.showOnMobile, css.timeAndturns)}
					>
						<div>
							{game.length.minutes}m{game.length.seconds}.
							{Math.floor(game.length.milliseconds / 10)}s
						</div>
						<div>
							{game.turns} Turn{game.turns !== 1 && 's'}
						</div>
					</div>
				</div>
			</div>
		)
	})

	const tabs = ['Statistics', 'My Games', 'Hall of Fame']

	return (
		<>
			<MenuLayout
				back={() => setMenuSection('main-menu')}
				title="Statistics"
				returnText="Main Menu"
				className={css.settingsMenu}
			>
				<div className={css.bigHallOfFameArea}>
					<div className={css.mainHallOfFameArea}>
						{tab === 'Statistics' && (
							<div className={css.fullLeftArea}>
								<Tabs selected={tab} setSelected={setTab} tabs={tabs} />
								<div className={css.tableArea}>
									<div className={css.stats}>
										<div className={css.stat}>
											<b className={css.statName}>Summary</b>
											<p>Amount</p>
											<p>Rate</p>
										</div>
										<div className={css.stat}>
											<p className={css.statName}>Total Wins</p>
											<p>{stats.wins + stats.forfeitWins}</p>
											<p>
												{formatDivision(
													stats.wins + stats.forfeitWins,
													stats.gamesPlayed,
													2,
												)}
											</p>
										</div>
										<div className={css.stat}>
											<p className={css.statName}>
												<span className={css.textTab}></span>Wins
											</p>
											<p>{stats.wins}</p>
											<p>{formatDivision(stats.wins, stats.gamesPlayed, 2)}</p>
										</div>
										<div className={css.stat}>
											<p className={css.statName}>
												<span className={css.textTab}></span>Forfeit Wins
											</p>
											<p>{stats.forfeitWins}</p>
											<p>
												{formatDivision(
													stats.forfeitWins,
													stats.gamesPlayed,
													2,
												)}
											</p>
										</div>
										<div className={css.stat}>
											<p className={css.statName}>Total Losses</p>
											<p>{stats.losses + stats.forfeitLosses}</p>
											<p>
												{formatDivision(
													stats.losses + stats.forfeitLosses,
													stats.gamesPlayed,
													2,
												)}
											</p>
										</div>
										<div className={css.stat}>
											<p className={css.statName}>
												<span className={css.textTab}></span>Losses
											</p>
											<p>{stats.losses}</p>
											<p>
												{formatDivision(stats.losses, stats.gamesPlayed, 2)}
											</p>
										</div>
										<div className={css.stat}>
											<p className={css.statName}>
												<span className={css.textTab}></span>Forfeit Losses
											</p>
											<p>{stats.forfeitLosses}</p>
											<p>
												{formatDivision(
													stats.forfeitLosses,
													stats.gamesPlayed,
													2,
												)}
											</p>
										</div>
										<div className={css.stat}>
											<p className={css.statName}>Ties</p>
											<p>{stats.ties}</p>
											<p>{formatDivision(stats.ties, stats.gamesPlayed, 2)}</p>
										</div>
										<div className={css.stat}>
											<p className={css.statName}>Games Played</p>
											<p>{stats.gamesPlayed}</p>
											<p></p>
										</div>
										<div className={css.stat}>
											<p className={css.statName}>Unique Players Encountered</p>
											<p>{stats.uniquePlayersEncountered}</p>
											<p></p>
										</div>
										<div className={css.stat}>
											<p className={css.statName}>Time Spent in Games</p>
											<p>
												{/* Looks better to default to minutes under 120 minutes */}
												{stats.playtime.hours >= 2
													? `${stats.playtime.hours}.${Math.round((stats.playtime.minutes + stats.playtime.seconds / 60) / 0.6)} hours`
													: `${stats.playtime.minutes}.${Math.round(stats.playtime.seconds / 0.6)} minutes`}
											</p>
										</div>
									</div>
									{/* Can't show when games are 0 bc a winrate makes no sense */}
									{stats.gamesPlayed > 0 && (
										<div className={css.stats}>
											<div className={css.stat}>
												<b className={css.statName}>Overall Winrate</b>
											</div>
											<div className={css.wtlBar}>
												<div
													className={css.win}
													style={{
														width: `${((stats.wins + stats.forfeitWins) / stats.gamesPlayed) * 100}%`,
													}}
												>
													{padDecimal(
														(stats.wins + stats.forfeitWins) /
															stats.gamesPlayed,
														2,
													)}
												</div>
												<div
													className={css.tie}
													style={{
														width: `${(stats.ties / stats.gamesPlayed) * 100}%`,
													}}
												></div>
												<div
													className={css.loss}
													style={{
														width: `${((stats.losses + stats.forfeitLosses) / stats.gamesPlayed) * 100}%`,
													}}
												>
													{padDecimal(
														(stats.losses + stats.forfeitLosses) /
															stats.gamesPlayed,
														2,
													)}
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						)}
						{tab === 'My Games' && (
							<div className={css.fullLeftArea}>
								<Tabs selected={tab} setSelected={setTab} tabs={tabs} />
								<div className={css.optionsButtonArea}>
									<div
										className={css.showOptionsButton}
										onClick={() => setShowGameFilters(!showGameFilters)}
									>
										{showGameFilters ? 'Hide' : 'Show'} Filters
									</div>
								</div>
								<div
									className={classNames(
										css.gameFiltersDropdown,
										!showGameFilters && css.hideOnMobile,
									)}
								>
									<div className={css.filter}>
										<div className={css.filterHeader}>Filter by Deck</div>
										<FilterComponent
											tagFilter={tagFilter}
											tagFilterAction={(option: string) => {
												const parsedOption = JSON.parse(option) as Tag

												if (option.includes('No Tag')) {
													setFilteredGames(
														filterGames(gameHistory, {tag: null}),
													)
													setTagFilter(null)
												} else {
													setFilteredGames(
														filterGames(gameHistory, {
															tag: parsedOption.key,
														}),
													)
													setTagFilter(parsedOption)
												}
											}}
											typeFilter={typeFilter}
											typeFilterAction={(option: string) => {
												setFilteredGames(
													filterGames(gameHistory, {type: option}),
												)
												setTypeFilter(option)
											}}
											nameFilterAction={(name: string) => {
												setFilteredGames(filterGames(gameHistory, {name}))
												setNameFilter(name)
											}}
											dropdownDirection={'down'}
										></FilterComponent>
									</div>
									<div className={css.filter}>
										<div className={css.filterHeader}>
											Filter by Opponent Name
										</div>
										<input
											placeholder={'Opponent name...'}
											onChange={(e) => {
												opponentNameFilterAction(e.target.value)
											}}
										></input>
									</div>
								</div>
								<div className={css.tableArea}>
									<div className={css.gameHistory}>
										<div
											className={classNames(
												css.gameHistoryHeader,
												css.hideOnMobile,
											)}
										>
											<div className={css.filter}>
												<div className={css.filterHeader}>Filter by Deck</div>
												<FilterComponent
													tagFilter={tagFilter}
													tagFilterAction={(option: string) => {
														const parsedOption = JSON.parse(option) as Tag

														if (option.includes('No Tag')) {
															setFilteredGames(
																filterGames(gameHistory, {tag: null}),
															)
															setTagFilter(null)
														} else {
															setFilteredGames(
																filterGames(gameHistory, {
																	tag: parsedOption.key,
																}),
															)
															setTagFilter(parsedOption)
														}
													}}
													typeFilter={typeFilter}
													typeFilterAction={(option: string) => {
														setFilteredGames(
															filterGames(gameHistory, {type: option}),
														)
														setTypeFilter(option)
													}}
													nameFilterAction={(name: string) => {
														setFilteredGames(filterGames(gameHistory, {name}))
														setNameFilter(name)
													}}
													dropdownDirection={'down'}
												></FilterComponent>
											</div>
											<div className={css.filter}>
												<div className={css.filterHeader}>
													Filter by Opponent Name
												</div>
												<input
													className={css.opponentInput}
													placeholder={'Opponent name...'}
													onChange={(e) => {
														opponentNameFilterAction(e.target.value)
													}}
												></input>
											</div>
										</div>
										<div className={css.gameHistoryGames}>
											{filteredGamesHtml.length ? (
												filteredGamesHtml
											) : (
												<p className={css.noResults}>No games found.</p>
											)}
										</div>
									</div>
								</div>
							</div>
						)}
						{tab === 'Hall of Fame' && (
							<div className={css.fullLeftArea}>
								<Tabs selected={tab} setSelected={setTab} tabs={tabs} />
								<div className={css.optionsButtonArea}>
									<DropdownComponent
										button={
											<div className={css.showOptionsButton}>
												Statistic: {title(selectedEndpoint)}
											</div>
										}
									/>
									<div
										className={css.showOptionsButton}
										onClick={() => setShowDropdown(!showDropdown)}
									>
										{showDropdown ? 'Hide' : 'Show'} Parameters
									</div>
								</div>
								<div className={classNames(css.tableArea, css.hof)}>
									{dataRetrieved && getTable()}
									{!dataRetrieved && (
										<div className={css.loadingIndicator}>
											<Spinner></Spinner>
											Loading...
										</div>
									)}
								</div>
							</div>
						)}
						{tab === 'Hall of Fame' && (
							<div
								className={classNames(
									css.hofSidebar,
									!showDropdown && css.hideOnMobile,
								)}
							>
								<div className={css.optionsHeader}></div>
								<div className={css.hofOptions}>
									<p className={css.hideOnMobile}>
										<b>Statistic</b>
									</p>
									<span className={css.hideOnMobile}>
										<DropdownComponent
											button={
												<DropDownButton>
													{title(selectedEndpoint)}
												</DropDownButton>
											}
										/>
									</span>
									<p className={css.hideOnMobile}>
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
													onCheck={() =>
														setShowTypeFrequency(!showTypeFrequency)
													}
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
						)}
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
			{showInvalidReplayModal && (
				<Modal
					setOpen
					title={'Invalid Replay Requested'}
					onClose={() => {
						setShowInvalidReplayModal(false)
						dispatch({
							type: localMessages.DATABASE_SET,
							data: {
								key: 'invalidReplay',
								value: false,
							},
						})
					}}
				>
					<Modal.Description>
						The replay you requested was not decoded properly. Please inform a
						developer. This game's code is: <b>{currentGame?.id}</b>
					</Modal.Description>
				</Modal>
			)}
			{showOverviewModal && (
				<Modal
					setOpen
					title={'Game Overview'}
					onClose={() => {
						setShowOverviewModal(false)
						dispatch({
							type: localMessages.DATABASE_SET,
							data: {
								key: 'replayOverview',
								value: [],
							},
						})
					}}
				>
					<Modal.Description>
						{overview.length === 0 ? (
							<div>Loading Overview...</div>
						) : (
							<div className={css.overview}>
								{overview.map((line) => {
									const isOpponent =
										currentGame?.firstPlayer.player === 'you'
											? line.sender.id !== overviewFirstId
											: line.sender.id === overviewFirstId

									return FormattedText(line.message, {
										isOpponent,
										color: isOpponent ? 'orange' : 'blue',
										isSelectable: true,
										censorProfanity: false,
									})
								})}
							</div>
						)}
					</Modal.Description>
				</Modal>
			)}
			{showReplayModal && (
				<Modal
					setOpen
					title={'Loading Replay'}
					onClose={() => null}
					disableCloseButton={true}
				>
					<Modal.Description>
						<div>Loading Replay...</div>
					</Modal.Description>
				</Modal>
			)}
		</>
	)
}

export default Statistics
