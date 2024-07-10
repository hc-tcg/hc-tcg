import {slot} from '../filters'
import {SlotComponent} from '../types/cards'
import {CardComponent} from '../types/game-state'
import {GameModel} from './game-model'

export function getCardPos(game: GameModel, instance: CardComponent) {
	const basicPos = game.findSlot(slot.hasInstance(instance))

	if (basicPos) {
		return new CardPosModel(game, basicPos, instance)
	}

	return null
}

/**
 * A wrapper class around the SlotInfo object that automatically updates our slot info when the card is moved.
 */
export class CardPosModel implements SlotComponent {
	private game: GameModel
	private internalPos: SlotComponent
	private instance: CardComponent

	constructor(game: GameModel, cardPos: SlotComponent, instance: CardComponent) {
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

	public get cardId() {
		// Return the card at the position, or try to recalculate if we moved (ender pearl, ladder)
		this.recalculateInternalPos()
		return this.internalPos.cardId
	}

	public get player() {
		if (!this.cardId) this.recalculateInternalPos()
		return this.internalPos.player
	}

	public get opponentPlayer() {
		if (!this.cardId) this.recalculateInternalPos()
		return this.internalPos.opponentPlayer
	}

	public get rowIndex() {
		if (!this.cardId) this.recalculateInternalPos()
		return this.internalPos.rowIndex
	}

	public get rowId() {
		if (!this.cardId) this.recalculateInternalPos()
		return this.internalPos.rowId
	}

	public get type() {
		if (!this.cardId) this.recalculateInternalPos()
		return this.internalPos.type
	}

	public get index() {
		if (!this.cardId) this.recalculateInternalPos()
		return this.internalPos.index
	}
}
