import { slot } from '../slot'
import {SlotInfo, SlotTypeT} from '../types/cards'
import {PlayerState, RowState} from '../types/game-state'
import {GameModel} from './game-model'

/**
 * Get the card position on the board for a card instance (in object form)
 */
export function getSlotInfo(game: GameModel, instance: string) {
	return game.findSlot(slot.hasInstance(instance))
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
