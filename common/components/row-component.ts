import {HasHealth} from '../cards/types'
import {PlayerEntity, RowEntity} from '../entities'
import type {GameModel} from '../models/game-model'
import {GameHook} from '../types/hooks'
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

	hooks: {
		/** Hook called when card in the health slot in this row is knocked out */
		onKnockOut: GameHook<(card: CardComponent<HasHealth>) => void>
	}

	constructor(
		game: GameModel,
		entity: RowEntity,
		playerId: PlayerEntity,
		index: number,
	) {
		this.game = game
		this.entity = entity
		this.playerId = playerId
		this.index = index
		this.health = null
		this.hooks = {
			onKnockOut: new GameHook(),
		}
	}

	get player(): PlayerComponent {
		return this.game.components.getOrError(this.playerId)
	}

	public getHermitSlot() {
		return this.game.components.find(
			SlotComponent,
			query.slot.hermit,
			query.slot.rowIs(this.entity),
		) as BoardSlotComponent
	}

	public getAttachSlot() {
		return this.game.components.find(
			SlotComponent,
			query.slot.attach,
			query.slot.rowIs(this.entity),
		) as BoardSlotComponent
	}

	public getItemSlots(excludeAdjacent: boolean = false) {
		return this.game.components.filter(
			SlotComponent,
			query.slot.item,
			query.some(
				query.slot.rowIs(this.entity),
				query.every(
					query.slot.adjacent(query.slot.rowIs(this.entity)),
					query.slot.row(
						(_game, value) =>
							'cyberpunkimpulse_rare' === value.getHermit()?.props.id,
					),
					(_game, value) => {
						const card = value.getCard()
						if (!card?.isItem()) return false
						return card.props.energy.includes('farm')
					},
					(_game, _value) => !excludeAdjacent,
				),
			),
		) as Array<BoardSlotComponent>
	}

	public getHermit() {
		return this.game.components.find(
			CardComponent,
			query.card.slot(query.slot.hermit),
			query.card.rowEntity(this.entity),
		)
	}

	public getAttach() {
		return this.game.components.find(
			CardComponent,
			query.card.slot(query.slot.attach),
			query.card.rowEntity(this.entity),
		)
	}

	public getItems(excludeAdjacent: boolean = false) {
		const itemSlots = this.getItemSlots(excludeAdjacent) as Array<SlotComponent>
		return this.game.components.filter(CardComponent, (_game, value) =>
			itemSlots.includes(value.slot),
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
			query.card.rowEntity(this.entity),
		)
		if (this.health === null) return
		if (!hermit?.isHealth()) return
		this.health = Math.min(
			this.health + amount,
			Math.max(this.health, hermit.props.health),
		)
	}
}
