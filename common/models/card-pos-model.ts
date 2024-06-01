import {Slot} from '../types/cards'
import {PlayerState, RowState} from '../types/game-state'
import {GameModel} from './game-model'

export type BasicCardPos = {
	player: PlayerState
	opponentPlayer: PlayerState
	rowIndex: number | null
	row: RowState | null
	slot: Slot
}

/**
 * Get the card position on the board for a card instance (in object form)
 */
export function getBasicCardPos(game: GameModel, instance: string): BasicCardPos | null {
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
				slot: {type: 'single_use', index: 0},
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
					slot: {type: 'hermit', index: 0},
				}
			} else if (row.effectCard?.cardInstance === instance) {
				return {
					player,
					opponentPlayer,
					rowIndex,
					row,
					slot: {type: 'effect', index: 0},
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
							slot: {type: 'item', index: i},
						}
					}
				}
			}
		}
	}

	return null
}

export function getCardPos(game: GameModel, instance: string) {
	const basicPos = getBasicCardPos(game, instance)

	if (basicPos) {
		return new CardPosModel(game, basicPos, instance)
	}

	return null
}

export function getCardAtPos(game: GameModel, pos: BasicCardPos) {
	const {player, rowIndex, slot} = pos

	const suCard = player.board.singleUseCard
	if (slot.type === 'single_use' && suCard) {
		return suCard
	}

	if (rowIndex === null) return null
	const row = player.board.rows[rowIndex]

	if (slot.type === 'hermit' && row.hermitCard) {
		return row.hermitCard
	}

	if (slot.type === 'effect' && row.effectCard) {
		return row.effectCard
	}

	if (slot.type === 'item' && row.itemCards[slot.index]) {
		return row.itemCards[slot.index] || null
	}

	return null
}

/**
 * A wrapper class around the card pos object, providing functionality that checks if a card has moved without breaking code
 */
export class CardPosModel {
	private game: GameModel
	private internalPos: BasicCardPos
	private instance: string

	/**
	 * Is this card pos fake - meaning not pointing to a card actually on the board?
	 *
	 * If this is true, we never attempt to recalculate the card pos
	 */
	public fake: boolean

	constructor(game: GameModel, cardPos: BasicCardPos, instance: string, fake: boolean = false) {
		this.game = game
		this.internalPos = cardPos
		this.instance = instance
		this.fake = fake
	}

	private recalculateInternalPos() {
		const newPos = getBasicCardPos(this.game, this.instance)

		// Only change the stored card pos if the card is somewhere else on the board - if it's nowhere change nothing
		if (newPos) {
			this.internalPos = newPos
		}
	}

	public get card() {
		// Return the card at the position, or try to recalculate if we moved (ender pearl, ladder)
		let card = getCardAtPos(this.game, this.internalPos)
		if (!this.fake && !card) {
			this.recalculateInternalPos()
			card = getCardAtPos(this.game, this.internalPos)
		}

		return card
	}

	public get player() {
		if (!this.fake && !this.card) this.recalculateInternalPos()
		return this.internalPos.player
	}

	public get opponentPlayer() {
		if (!this.fake && !this.card) this.recalculateInternalPos()
		return this.internalPos.opponentPlayer
	}

	public get rowIndex() {
		if (!this.fake && !this.card) this.recalculateInternalPos()
		return this.internalPos.rowIndex
	}

	public get row() {
		if (!this.fake && !this.card) this.recalculateInternalPos()
		return this.internalPos.row
	}

	public get slot() {
		if (!this.fake && !this.card) this.recalculateInternalPos()
		return this.internalPos.slot
	}
}
