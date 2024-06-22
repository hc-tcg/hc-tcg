import {SlotInfo, SlotTypeT} from '../types/cards'
import {PlayerState, RowState} from '../types/game-state'
import {GameModel} from './game-model'

/**
 * Get the card position on the board for a card instance (in object form)
 */
export function getSlotInfo(game: GameModel, instance: string): SlotInfo | null {
	const ids = game.getPlayerIds()
	for (let i = 0; i < ids.length; i++) {
		const playerId = ids[i]
		const player = game.state.players[playerId]

		const opponentPlayerId = ids.find((id) => id !== playerId)
		if (!opponentPlayerId) continue
		const opponentPlayer = game.state.players[opponentPlayerId]

		const board = game.state.players[playerId].board

		// single use slot
		if (board.singleUseCard?.cardInstance === instance) {
			return {
				player,
				opponentPlayer,
				rowIndex: null,
				row: null,
				type: 'single_use',
				card: board.singleUseCard,
				index: 0,
			}
		}

		// go through rows to find instance
		for (let rowIndex = 0; rowIndex < board.rows.length; rowIndex++) {
			const row = board.rows[rowIndex]

			if (row.hermitCard?.cardInstance === instance) {
				return {
					player,
					opponentPlayer,
					rowIndex,
					row,
					type: 'hermit',
					card: row.hermitCard,
					index: 0,
				}
			} else if (row.effectCard?.cardInstance === instance) {
				return {
					player,
					opponentPlayer,
					rowIndex,
					row,
					type: 'effect',
					card: row.effectCard,
					index: 0,
				}
			} else {
				for (let i = 0; i < row.itemCards.length; i++) {
					const card = row.itemCards[i]
					if (card?.cardInstance === instance) {
						return {
							player,
							opponentPlayer,
							rowIndex,
							row,
							type: 'item',
							card: card,
							index: i,
						}
					}
				}
			}
		}
	}

	return null
}

export function getCardPos(game: GameModel, instance: string) {
	const basicPos = getSlotInfo(game, instance)

	if (basicPos) {
		return new CardPosModel(game, basicPos, instance)
	}

	return null
}

export function getCardAtPos(pos: SlotInfo) {
	const {player, rowIndex, type, index} = pos

	const suCard = player.board.singleUseCard
	if (type === 'single_use' && suCard) {
		return suCard
	}

	if (rowIndex === null) return null
	const row = player.board.rows[rowIndex]

	if (type === 'hermit' && row.hermitCard) {
		return row.hermitCard
	}

	if (type === 'effect' && row.effectCard) {
		return row.effectCard
	}

	if (type === 'item' && index && row.itemCards[index]) {
		return row.itemCards[index] || null
	}

	return null
}

/**
 * A wrapper class around the card pos object, providing functionality that checks if a card has moved without breaking code
 */
export class CardPosModel {
	private game: GameModel
	private internalPos: SlotInfo
	private instance: string

	constructor(game: GameModel, cardPos: SlotInfo, instance: string) {
		this.game = game
		this.internalPos = cardPos
		this.instance = instance
	}

	private recalculateInternalPos() {
		const newPos = getSlotInfo(this.game, this.instance)

		// Only change the stored card pos if the card is somewhere else on the board - if it's nowhere change nothing
		if (newPos) {
			this.internalPos = newPos
		}
	}

	public get card() {
		// Return the card at the position, or try to recalculate if we moved (ender pearl, ladder)
		let card = getCardAtPos(this.internalPos)
		if (!card) {
			this.recalculateInternalPos()
			card = getCardAtPos(this.internalPos)
		}

		return card
	}

	public get player() {
		if (!this.card) this.recalculateInternalPos()
		return this.internalPos.player
	}

	public get opponentPlayer() {
		if (!this.card) this.recalculateInternalPos()
		return this.internalPos.opponentPlayer
	}

	public get rowIndex() {
		if (!this.card) this.recalculateInternalPos()
		return this.internalPos.rowIndex
	}

	public get row() {
		if (!this.card) this.recalculateInternalPos()
		return this.internalPos.row
	}

	public get type() {
		if (!this.card) this.recalculateInternalPos()
		return this.internalPos.type
	}

	public get index() {
		if (!this.card) this.recalculateInternalPos()
		return this.internalPos.index
	}
}
