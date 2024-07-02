import {slot} from '../slot'
import {SlotInfo} from '../types/cards'
import {CardInstance} from '../types/game-state'
import {GameModel} from './game-model'

export function getCardPos(game: GameModel, instance: CardInstance) {
	const basicPos = game.findSlot(slot.hasInstance(instance))

	if (basicPos) {
		return new CardPosModel(game, basicPos, instance)
	}

	return null
}

/**
 * A wrapper class around the SlotInfo object that automatically updates our slot info when the card is moved.
 */
export class CardPosModel implements SlotInfo {
	private game: GameModel
	private internalPos: SlotInfo
	private instance: CardInstance

	constructor(game: GameModel, cardPos: SlotInfo, instance: CardInstance) {
		this.game = game
		this.internalPos = cardPos
		this.instance = instance
	}

	private recalculateInternalPos() {
		const newPos = this.game.findSlot(slot.hasInstance(this.instance))

		// Only change the stored card pos if the card is somewhere else on the board - if it's nowhere change nothing
		if (newPos) {
			this.internalPos = newPos
		}
	}

	public get card() {
		// Return the card at the position, or try to recalculate if we moved (ender pearl, ladder)
		this.recalculateInternalPos()
		return this.internalPos.card
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
