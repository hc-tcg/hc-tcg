import type {GameModel} from '../models/game-model'
import type {PlayerEntity, RowEntity} from '../types/game-state'
import {CardComponent} from './card-component'
import {card, slot} from './query'
import {BoardSlotComponent, SlotComponent} from './slot-component'

export class RowComponent {
	readonly game: GameModel
	readonly entity: RowEntity
	playerId: PlayerEntity
	index: number
	/* The health of the hermit. Health is null then there is no hermit residing in this row */
	health: number | null

	constructor(game: GameModel, entity: RowEntity, playerId: PlayerEntity, index: number) {
		this.game = game
		this.entity = entity
		this.playerId = playerId
		this.index = index
		this.health = null
	}

	get player() {
		return this.game.components.getOrError(this.playerId)
	}

	public getHermitSlot() {
		return this.game.components.find(
			SlotComponent,
			slot.hermitSlot,
			slot.rowIs(this.entity)
		) as BoardSlotComponent
	}

	public getAttachSlot() {
		return this.game.components.find(
			SlotComponent,
			slot.attachSlot,
			slot.rowIs(this.entity)
		) as BoardSlotComponent
	}

	public getItemSlots() {
		return this.game.components.filter(
			SlotComponent,
			slot.itemSlot,
			slot.rowIs(this.entity)
		) as Array<BoardSlotComponent>
	}

	public getHermit() {
		return this.game.components.find(
			CardComponent,
			card.slot(slot.hermitSlot),
			card.rowIs(this.entity)
		)
	}

	public getAttach() {
		return this.game.components.find(
			CardComponent,
			card.slot(slot.attachSlot),
			card.rowIs(this.entity)
		)
	}

	public getItems() {
		return this.game.components.filter(
			CardComponent,
			card.slot(slot.itemSlot),
			card.rowIs(this.entity)
		)
	}

	public damage(amount: number) {
		// Deduct and clamp health
		if (this.health === null) return
		const newHealth = Math.max(this.health - amount, 0)
		this.health = Math.min(newHealth, this.health)
	}

	public heal(amount: number) {
		let hermit = this.game.components.find(CardComponent, card.isHermit, card.rowIs(this.entity))
		if (this.health === null) return
		if (!hermit?.isHealth()) return
		this.health = Math.min(this.health + amount, hermit.props.health)
	}
}
