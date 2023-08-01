import {CardT, GameState, RowStateWithHermit} from 'common/types/game-state'
import {ITEM_CARDS} from 'common/cards'
import {DEBUG_CONFIG} from 'common/config'
import {GameModel} from 'common/models/game-model'
import {equalCard} from 'common/utils/cards'
import {getCardPos} from 'common/models/card-pos-model'
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
 * @param {string} playerId
 */
export const getOpponentId = (game: GameModel, playerId: string) => {
	const players = game.getPlayers()
	return players.filter((p) => p.playerId !== playerId)[0]?.playerId
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
 */
export function printHooksState(game: GameModel) {
	const {currentPlayer, opponentPlayer: opponentPlayer} = game
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
