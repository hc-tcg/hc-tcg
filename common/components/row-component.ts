import assert from 'node:assert'
import {HasHealth} from '../cards/types'
import {PlayerEntity, RowEntity, SlotEntity} from '../entities'
import type {GameModel} from '../models/game-model'
import {GameHook} from '../types/hooks'
import {CardComponent} from './card-component'
import {PlayerComponent} from './player-component'
import query from './query'
import {BoardSlotComponent, SlotComponent} from './slot-component'
import {StatusEffectComponent} from './status-effect-component'

export class RowComponent {
	public static table = 'rows'

	readonly game: GameModel
	readonly entity: RowEntity
	playerId: PlayerEntity
	index: number
	/* The health of the hermit. Health is null then there is no hermit residing in this row */
	health: number | null

	/* These MUST be set after the component is created or the game will not function */
	public hermitSlotEntity?: SlotEntity
	public attachSlotEntity?: SlotEntity
	public effectSlotEntity?: SlotEntity
	public itemsSlotEntities?: Array<SlotEntity>

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

	public get hermitSlot(): BoardSlotComponent {
		assert(this.hermitSlotEntity)
		return this.game.components.getOrError(
			this.hermitSlotEntity,
		) as BoardSlotComponent
	}

	public get attachSlot(): BoardSlotComponent {
		assert(this.attachSlotEntity)
		return this.game.components.getOrError(
			this.attachSlotEntity,
		) as BoardSlotComponent
	}

	public get itemSlots(): Array<BoardSlotComponent> {
		assert(this.itemsSlotEntities)
		return this.itemsSlotEntities.map((x) =>
			this.game.components.getOrError(x),
		) as any
	}

	public getHermit() {
		return this.hermitSlot.card
	}

	public getAttach() {
		return this.attachSlot.card
	}

	public getItems() {
		const itemSlots = this.itemSlots as Array<SlotComponent>
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
		const overhealed = this.game.components.exists(
			StatusEffectComponent,
			query.effect.targetIsCardAnd(query.card.entity(hermit.entity)),
			query.effect.id('overhealed'),
		)
		if (overhealed) {
			//@TODO Make this less hacky.
			this.health = this.health + amount
			return
		}
		this.health = Math.min(
			this.health + amount,
			Math.max(this.health, hermit.props.health),
		)
	}

	public fullHeal() {
		let hermit = this.game.components.find(
			CardComponent,
			query.card.isHermit,
			query.card.rowEntity(this.entity),
		)
		if (this.health === null) return
		if (!hermit?.isHealth()) return
		this.health = Math.max(this.health, hermit.props.health)
	}
}
