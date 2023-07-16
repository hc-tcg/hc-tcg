import {
	AvailableActionT,
	CardT,
	CoinFlipT,
	GameState,
	PlayerState,
	RowState,
	RowStateWithHermit,
} from '../../common/types/game-state'
import CARDS, {ITEM_CARDS, EFFECT_CARDS} from '../../common/cards'
import {DEBUG_CONFIG} from '../../config'
import {GameModel} from '../models/game-model'
import {getCardPos} from './cards'
import {EnergyT, RowPos} from '../../common/types/cards'
import {PickedSlots} from '../../common/types/pick-process'

export function equalCard(card1: CardT | null, card2: CardT | null) {
	if (!card1 && !card2) return true
	if (!card1 || !card2) return false
	return card1.cardId === card2.cardId && card1.cardInstance === card2.cardInstance
}

export function hasEnoughEnergy(energy: Array<EnergyT>, cost: Array<EnergyT>) {
	const remainingEnergy = energy.slice()

	const specificCost = cost.filter((item) => item !== 'any')
	const anyCost = cost.filter((item) => item === 'any')
	const hasEnoughSpecific = specificCost.every((costItem) => {
		// First try find the exact card
		let index = remainingEnergy.findIndex((energyItem) => energyItem === costItem)
		if (index === -1) {
			// Then try find an "any" card
			index = remainingEnergy.findIndex((energyItem) => energyItem === 'any')
			if (index === -1) return
		}
		remainingEnergy.splice(index, 1)
		return true
	})
	if (!hasEnoughSpecific) return false

	// check if remaining energy is enough to cover required "any" cost
	return remainingEnergy.length >= anyCost.length
}
export function hasSingleUse(playerState: PlayerState, id: string, isUsed: boolean = false) {
	const suCard = playerState.board.singleUseCard
	const suUsed = playerState.board.singleUseCardUsed
	return suCard?.cardId === id && suUsed === isUsed
}

/**
 * @param {GameModel} game
 * @param {import('../../common/types/pick-process').PickedSlots} pickedSlots
 * @param {*} modalResult
 * @returns {boolean}
 */
export function applySingleUse(
	game: GameModel,
	pickedSlots: PickedSlots = {},
	modalResult: any = null
): boolean {
	const {currentPlayer} = game

	const suCard = currentPlayer.board.singleUseCard
	if (!suCard) return false
	const pos = getCardPos(game, suCard.cardInstance)
	if (!pos) return false

	const cardInstance = currentPlayer.board.singleUseCard?.cardInstance
	if (!cardInstance) return false

	currentPlayer.hooks.beforeApply.call(pickedSlots, modalResult)

	currentPlayer.board.singleUseCardUsed = true

	currentPlayer.hooks.onApply.call(pickedSlots, modalResult)
	currentPlayer.hooks.afterApply.call(pickedSlots, modalResult)

	return true
}

/*
Return reference to the object holding the card and key at which it is located
Looks only through hand and item/effect/hermit slots.
*/
/**
 * @param {import('common/types/game-state').GameState} gameState
 * @param {CardT | null} card
 */
export function findCard(gameState: GameState, card: CardT | null) {
	const pStates = Object.values(gameState.players)
	for (let pState of pStates) {
		const playerId = pState.id
		const handIndex = pState.hand.findIndex((handCard) => equalCard(handCard, card))
		if (handIndex !== -1) return {playerId, target: pState.hand, key: handIndex}

		const rows = pState.board.rows
		for (let row of rows) {
			if (equalCard(row.hermitCard, card)) return {playerId, target: row, key: 'hermitCard'}
			if (equalCard(row.effectCard, card)) return {playerId, target: row, key: 'effectCard'}
			const itemIndex = row.itemCards.findIndex((itemCard) => equalCard(itemCard, card))
			if (itemIndex !== -1) return {playerId, target: row.itemCards, key: itemIndex}
		}
	}
	return null
}

/**
 * @param {GameModel} game
 * @param {CardT} card
 */
export function moveCardToHand(game: GameModel, card: CardT, steal = false) {
	const cardPos = getCardPos(game, card.cardInstance)
	if (!cardPos) return

	const cardInfo = CARDS[card.cardId]
	cardInfo.onDetach(game, card.cardInstance, cardPos)

	cardPos.player.hooks.onDetach.call(card.cardInstance)

	if (cardPos.row && cardPos.slot.type === 'hermit') {
		cardPos.row.hermitCard = null
	} else if (cardPos.row && cardPos.slot.type === 'effect') {
		cardPos.row.effectCard = null
	} else if (cardPos.row && cardPos.slot.type === 'item') {
		cardPos.row.itemCards[cardPos.slot.index] = null
	} else if (cardPos.slot.type === 'single_use') {
		cardPos.player.board.singleUseCard = null
	}

	const player = steal ? cardPos.opponentPlayer : cardPos.player
	player.hand.push(card)
}

/**
 * @param {GameModel} game
 * @param {CardT | null} card
 */
export function discardCard(game: GameModel, card: CardT | null, steal = false) {
	if (!card) return
	const loc = findCard(game.state, card)
	const pos = getCardPos(game, card.cardInstance)
	if (!loc) {
		const err = new Error()
		console.log('Cannot find card: ', card, err.stack)
		return
	}

	// Cards on the Board
	if (pos) {
		const cardInfo = CARDS[card.cardId]
		cardInfo.onDetach(game, card.cardInstance, pos)

		// Call onDetach hook
		const player = getCardPos(game, card.cardInstance)?.player
		if (player) {
			player.hooks.onDetach.call(card.cardInstance)
		}
	}

	//@ts-ignore
	loc.target[loc.key] = null
	Object.values(game.state.players).forEach((pState) => {
		pState.hand = pState.hand.filter(Boolean)
	})

	const playerId = steal && pos ? pos.opponentPlayer.id : loc.playerId

	game.state.players[playerId].discarded.push({
		cardId: card.cardId,
		cardInstance: card.cardInstance,
	})
}

/**
 * @param {GameModel} game
 * @param {CardT | null} card
 */
export function retrieveCard(game: GameModel, card: CardT | null) {
	if (!card) return
	for (let playerId in game.state.players) {
		const player = game.state.players[playerId]
		const discarded = player.discarded
		const index = discarded.findIndex((c) => equalCard(c, card))
		if (index !== -1) {
			const retrievedCard = discarded.splice(index, 1)[0]
			player.hand.push(retrievedCard)
			return
		}
	}
}

/**
 * @param {GameModel} game
 * @param {PlayerState} playerState
 */
export function discardSingleUse(game: GameModel, playerState: PlayerState) {
	const suCard = playerState.board.singleUseCard
	const suUsed = playerState.board.singleUseCardUsed
	if (!suCard) return
	const pos = getCardPos(game, suCard.cardInstance)
	if (!pos) return

	// Water and Milk Buckets can be on this slot so we use CARDS to get the card info
	const cardInfo = CARDS[suCard.cardId]
	cardInfo.onDetach(game, suCard.cardInstance, pos)

	// Call onDetach hook
	playerState.hooks.onDetach.call(suCard.cardInstance)

	playerState.board.singleUseCardUsed = false
	playerState.board.singleUseCard = null

	if (suUsed) {
		playerState.discarded.push(suCard)
	} else {
		playerState.hand.push(suCard)
	}
}

/**
 * @param {PlayerState} playerState
 * @param {number} amount
 */
export function drawCards(playerState: PlayerState, amount: number) {
	for (let i = 0; i < Math.min(playerState.pile.length, amount); i++) {
		const drawCard = playerState.pile.shift()
		if (drawCard) playerState.hand.push(drawCard)
	}
}

/**
 * @param {PlayerState} playerTossingCoin
 * @param {string} cardId
 * @param {number} times
 * @param {PlayerState | null} currentPlayer
 * @returns {Array<CoinFlipT>}
 */
export function flipCoin(
	playerTossingCoin: PlayerState,
	cardId: string,
	times: number = 1,
	currentPlayer: PlayerState | null = null
): Array<CoinFlipT> {
	const forceHeads = DEBUG_CONFIG.forceCoinFlip
	const activeRowIndex = playerTossingCoin.board.activeRow
	if (activeRowIndex === null) {
		console.log(`${cardId} attempted to flip coin with no active row!, that shouldn't be possible`)
		return []
	}
	const forceTails = !!playerTossingCoin.board.rows[activeRowIndex].ailments.find(
		(a) => a.id === 'badomen'
	)

	/** @type {Array<CoinFlipT>} */
	let coinFlips: Array<CoinFlipT> = []
	for (let i = 0; i < times; i++) {
		if (forceHeads) {
			coinFlips.push('heads')
		} else if (forceTails) {
			coinFlips.push('tails')
		} else {
			/** @type {CoinFlipT} */
			const coinFlip: CoinFlipT = Math.random() > 0.5 ? 'heads' : 'tails'
			coinFlips.push(coinFlip)
		}
	}

	playerTossingCoin.hooks.onCoinFlip.call(cardId, coinFlips)

	const name = CARDS[cardId].name
	const player = currentPlayer || playerTossingCoin
	player.coinFlips.push({
		name: !currentPlayer ? name : 'Opponent ' + name,
		tosses: coinFlips,
	})

	return coinFlips
}

/**
 * @param {GameModel} game
 * @param {string} playerId
 */
export const getOpponentId = (game: GameModel, playerId: string) => {
	const players = game.getPlayers()
	return players.filter((p) => p.playerId !== playerId)[0]?.playerId
}

/**
 * @param {CardT} card
 */
export const isRemovable = (card: CardT) => {
	const cardInfo = EFFECT_CARDS[card.cardId]
	if (!cardInfo) return false
	return cardInfo.getIsRemovable()
}

/**
 * @param {PlayerState} playerState
 * @returns {boolean}
 */
export function isActive(playerState: PlayerState): boolean {
	return playerState.board.activeRow !== null
}

/**
 * @param {PlayerState} playerState
 * @returns {RowStateWithHermit | null}
 */
export function getActiveRow(playerState: PlayerState): RowStateWithHermit | null {
	if (playerState.board.activeRow === null) return null
	const row = playerState.board.rows[playerState.board.activeRow]
	if (!row.hermitCard) return null
	return row
}

/**
 * @param {PlayerState} playerState
 * @returns {import('types/cards').RowPos | null}
 */
export function getActiveRowPos(playerState: PlayerState): RowPos | null {
	const rowIndex = playerState.board.activeRow
	if (rowIndex === null) return null
	const row = playerState.board.rows[rowIndex]
	if (!row.hermitCard) return null
	return {
		player: playerState,
		rowIndex,
		row,
	}
}

/**
 * @param {PlayerState} playerState
 * @param {boolean} includeActive
 * @returns {import('types/cards').RowPos[]}
 */
export function getNonEmptyRows(playerState: PlayerState, includeActive: boolean = true): RowPos[] {
	/** @type {import('types/cards').RowPos[]} */
	const rows: RowPos[] = []
	const activeRowIndex = playerState.board.activeRow
	for (let i = 0; i < playerState.board.rows.length; i++) {
		const row = playerState.board.rows[i]
		if (i === activeRowIndex && !includeActive) continue
		if (row.hermitCard) rows.push({player: playerState, rowIndex: i, row})
	}
	return rows
}

/**
 * @param {PlayerState} playerState
 * @param {boolean} includeActive
 * @returns {RowStateWithHermit[]}
 */
export function getRowsWithEmptyItemsSlots(
	playerState: PlayerState,
	includeActive: boolean = true
): RowStateWithHermit[] {
	const result: Array<RowStateWithHermit> = []
	const activeRow = playerState.board.activeRow
	const rows = playerState.board.rows
	for (let i = 0; i < rows.length; i++) {
		const row = rows[i]
		if (i === activeRow && !includeActive) continue
		if (row.hermitCard && !isRowFull(row)) result.push(row)
	}
	return result
}

/**
 * @param {PlayerState} playerState
 * @returns {Array<RowStateWithHermit[]>}
 */
export function getAdjacentRows(playerState: PlayerState): Array<RowStateWithHermit[]> {
	const result: Array<RowStateWithHermit[]> = []
	const rows = playerState.board.rows
	for (let i = 1; i < rows.length + 1; i++) {
		const row = rows[i]
		const prevRow = rows[i - 1]
		if (row && prevRow && row.hermitCard && prevRow.hermitCard) result.push([prevRow, row])
	}
	return result
}

/**
 * @param {GameModel} game
 * @param {import('common/types/game-state').AvailableActionT} action
 */
export function isActionAvailable(game: GameModel, action: AvailableActionT) {
	return game.turnState.availableActions.includes(action)
}

/**
 * @param {RowStateWithHermit} row
 * @returns {boolean}
 */
export function isRowFull(row: RowStateWithHermit): boolean {
	return row.itemCards.filter((card) => !!card).length === 3
}

/**
 * @param {RowStateWithHermit} row
 * @returns {boolean}
 */
export function isRowEmpty(row: RowStateWithHermit): boolean {
	return row.itemCards.filter((card) => !!card).length === 0
}

/**
 * @param {RowState} row
 * @returns {boolean}
 */
export function rowHasItem(row: RowState): boolean {
	const itemCards = row.itemCards
	let total = 0
	for (const itemCard of itemCards) {
		if (!itemCard) continue
		const cardInfo = ITEM_CARDS[itemCard.cardId]
		// String
		if (!cardInfo) continue
		total += 1
	}

	return total > 0
}

/**
 * @param {RowStateWithHermit} row
 * @returns {boolean}
 */
export function rowHasEmptyItemSlot(row: RowStateWithHermit): boolean {
	return row.itemCards.filter((card) => !card).length > 0
}

/**
 * @param {GameModel} game
 * @param {RowStateWithHermit} row
 * @returns {number}
 */
export function getItemCardsEnergy(game: GameModel, row: RowStateWithHermit): number {
	const itemCards = row.itemCards
	let total = 0
	for (const itemCard of itemCards) {
		if (!itemCard) continue
		const cardInfo = ITEM_CARDS[itemCard.cardId]
		// String
		if (!cardInfo) continue
		const pos = getCardPos(game, itemCard.cardInstance)
		if (!pos) continue
		total += cardInfo.getEnergy(game, itemCard.cardInstance, pos).length
	}

	return total
}

/**
 * @param {GameModel} game
 * @param {CardT | null} card
 * @param {CardT | null} cardAttaching
 * @returns {boolean}
 */
export function canAttachToCard(
	game: GameModel,
	card: CardT | null,
	cardAttaching: CardT | null
): boolean {
	if (!card || !cardAttaching) return false

	const cardAttachingPos = getCardPos(game, cardAttaching.cardInstance)
	const cardInfo = CARDS[card.cardId]
	if (!cardAttachingPos || !cardInfo) return false

	if (!cardInfo.canAttachToCard(game, cardAttachingPos)) return false

	return true
}

/**
 * @param {GameModel} game
 */
export function printHooksState(game: GameModel) {
	const {currentPlayer, opponentPlayer} = game
	const cardsInfo: Record<string, any> = {}
	let instancesInfo: Record<string, any> = {}
	const customValues: Record<string, any> = {}

	// First loop to populate cardsInfo
	for (const player of [currentPlayer, opponentPlayer]) {
		for (const card of player.playerDeck) {
			cardsInfo[card.cardInstance] = {
				card,
				player: player,
			}
		}
	}

	// Second loop to populate instancesInfo and customValues
	for (const player of [currentPlayer, opponentPlayer]) {
		// Instance Info
		for (const [hookName, hookValue] of Object.entries(player.hooks)) {
			Object.keys(hookValue.listeners).forEach((instance, i) => {
				const pos = getCardPos(game, instance)
				const inBoard = Boolean(pos)
				const instanceEntry = instancesInfo[instance] || {
					board: inBoard,
					hooks: [],
					card: cardsInfo[instance].card,
					player: cardsInfo[instance].player,
					slot: pos?.slot,
					row: pos?.rowIndex,
				}

				instanceEntry.hooks.push(`#${i + 1} | ${player.playerName}.${hookName}`)
				instancesInfo[instance] = instanceEntry
			})
		}

		// Sort by row
		instancesInfo = Object.fromEntries(
			Object.entries(instancesInfo).sort(([, valueA], [, valueB]) => {
				let aRow = valueA.row
				let bRow = valueB.row
				if (aRow === null && bRow === null) return 0
				if (aRow === null) return -1
				if (bRow === null) return 1
				return aRow - bRow
			})
		)

		// Custom Values
		for (const [instanceKey, custom] of Object.entries(player.custom)) {
			const [id, instance, keyName] = instanceKey.split(':')
			customValues[instance] = {id, value: custom, keyName}
		}
	}

	// Helpers to print
	const colorize = (text: any, color: any) => {
		const colors: Record<string, string> = {
			reset: '\x1b[0m',
			blink: '\x1b[5m',
			black: '\x1b[30m',
			red: '\x1b[31m',
			green: '\x1b[32m',
			yellow: '\x1b[33m',
			blue: '\x1b[34m',
			magenta: '\x1b[35m',
			cyan: '\x1b[36m',
			white: '\x1b[37m',
			brightBlack: '\x1b[30;1m',
			brightRed: '\x1b[31;1m',
			brightGreen: '\x1b[32;1m',
			brightYellow: '\x1b[33;1m',
			brightBlue: '\x1b[34;1m',
			brightMagenta: '\x1b[35;1m',
			brightCyan: '\x1b[36;1m',
			brightWhite: '\x1b[37;1m',
		}

		return colors[color] + text + colors['reset']
	}

	const drawLine = (width: any) => {
		return '\u2550'.repeat(width)
	}

	const drawBox = (text: any, width: any) => {
		const lines = text.split('\n')
		const maxLength = Math.max(width, ...lines.map((line: any) => line.length))
		const top = `\u2554${drawLine(maxLength)}\u2557`
		const bottom = `\u255A${drawLine(maxLength)}\u255D`
		const middle = lines
			.map((line: any) => `\u2551 ${line.padEnd(maxLength - 2, ' ')} \u2551`)
			.join('\n')

		return `${top}\n${middle}\n${bottom}`
	}

	// Print to console
	if (DEBUG_CONFIG.showHooksState.clearConsole) console.clear()
	const turnInfo = `TURN: ${game.state.turn}, CURRENT PLAYER: ${currentPlayer.playerName}`
	console.log(colorize(drawBox(turnInfo, 60), 'cyan'))

	for (const instance in instancesInfo) {
		const info = instancesInfo[instance]
		const slot = info.slot
		const row = info.row
		const attachedStatus = info.board
			? colorize('ATTACHED', 'green')
			: colorize('DETACHED', 'brightRed') + colorize(colorize('!', 'blink'), 'brightRed')
		const slotIndex = slot?.type === 'item' ? ':' + slot.index : ''
		const slotType = slot?.type ? slot.type : ''
		const rowIndex = row !== null ? 'Row: ' + row + ' - ' : ''

		console.log(
			`${info.player.playerName} | ${rowIndex}${slotType}${slotIndex}${slotType ? ' | ' : ''}${
				info.card.cardId
			} - ${attachedStatus}`
		)
		console.log(colorize(drawLine(60), 'white'))

		for (const hook of info.hooks) {
			console.log(colorize(hook, 'brightYellow'))
		}

		const custom = customValues[instance]
		if (custom) {
			let output = custom.keyName
				? custom.keyName + ' = ' + custom.value
				: custom.id + ':' + instance + ' = ' + custom.value
			console.log(colorize(output, 'brightMagenta'))
		}

		console.log('\n')
	}
}
