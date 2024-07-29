import {PlayerEntity, RowEntity} from '../entities'
import type {GameModel} from '../models/game-model'
import {CardComponent} from './card-component'
import {PlayerComponent} from './player-component'
import query from './query'
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

	get player(): PlayerComponent {
		return this.game.components.getOrError(this.playerId)
	}

	public getHermitSlot() {
		return this.game.components.find(
			SlotComponent,
			query.slot.hermit,
			query.slot.rowIs(this.entity)
		) as BoardSlotComponent
	}

	public getAttachSlot() {
		return this.game.components.find(
			SlotComponent,
			query.slot.attach,
			query.slot.rowIs(this.entity)
		) as BoardSlotComponent
	}

	public getItemSlots() {
		return this.game.components.filter(
			SlotComponent,
			query.slot.item,
			query.slot.rowIs(this.entity)
		) as Array<BoardSlotComponent>
	}

	public getHermit() {
		return this.game.components.find(
			CardComponent,
			query.card.slot(query.slot.hermit),
			query.card.rowEntity(this.entity)
		)
	}

	public getAttach() {
		return this.game.components.find(
			CardComponent,
			query.card.slot(query.slot.attach),
			query.card.rowEntity(this.entity)
		)
	}

	public getItems() {
		return this.game.components.filter(
			CardComponent,
			query.card.slot(query.slot.item),
			query.card.rowEntity(this.entity)
		)
	}

	public damage(amount: number) {
		// Deduct and clamp health
		if (this.health === null) return
		const newHealth = Math.max(this.health - amount, 0)
		this.health = Math.min(newHealth, this.health)
	}

	public heal(amount: number) {
		let hermit = this.game.components.find(
			CardComponent,
			query.card.isHermit,
			query.card.rowEntity(this.entity)
		)
		if (this.health === null) return
		if (!hermit?.isHealth()) return
		this.health = Math.min(this.health + amount, hermit.props.health)
	}
}
