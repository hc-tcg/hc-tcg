import {CARDS} from '../cards'
import Card, {
	Attach,
	CardProps,
	HasHealth,
	Hermit,
	Item,
	SingleUse,
	isAttach,
	isHealth,
	isHermit,
	isItem,
	isSingleUse,
} from '../cards/base/card'
import {card} from '../filters'
import {GameModel} from '../models/game-model'
import StatusEffect, {Counter, StatusEffectProps, isCounter} from '../status-effects/status-effect'
import {SlotTypeT} from './cards'
import {
	CardEntity,
	PlayerId,
	PlayerState,
	RowEntity,
	SlotEntity,
	StatusEffectEntity,
} from './game-state'
import {LocalCardInstance, LocalStatusEffectInstance, WithoutFunctions} from './server-requests'

export class Component {}

export class CardComponent<Props extends CardProps = CardProps> {
	readonly game: GameModel
	readonly card: Card<Props>
	readonly entity: CardEntity
	readonly playerId: PlayerId

	slotEntity: SlotEntity | null

	constructor(game: GameModel, entity: CardEntity, id: string, playerId: PlayerId) {
		this.game = game
		this.entity = entity
		this.card = CARDS[id] as any
		this.playerId = playerId
		this.slotEntity = null
		this.playerId = playerId
	}

	static fromLocalCardInstance(
		game: GameModel,
		localCardInstance: LocalCardInstance
	): CardComponent {
		for (const card of game.state.cards.list()) {
			if (card.entity == localCardInstance.instance) {
				return card
			}
		}
		throw new Error('An ID for a nonexistent card should never be created')
	}

	public toLocalCardInstance(): LocalCardInstance<Props> {
		return {
			props: this.card.props as WithoutFunctions<Props>,
			instance: this.entity,
			slot: this.slotEntity,
		}
	}

	public get props(): Props {
		return this.card.props
	}

	public get slot(): SlotComponent | null {
		return this.game.state.slots.get(this.slotEntity)
	}

	public set slot(component: SlotComponent) {
		this.slotEntity = component.entity
	}

	public get player(): PlayerState {
		return this.game.state.players[this.playerId]
	}

	public get opponentPlayer(): PlayerState {
		return this.game.state.players[this.game.otherPlayer(this.playerId)]
	}

	public isItem(): this is CardComponent<Item> {
		return isItem(this.props)
	}
	public isSingleUse(): this is CardComponent<SingleUse> {
		return isSingleUse(this.props)
	}
	public isAttach(): this is CardComponent<Attach> {
		return isAttach(this.props)
	}
	public isHealth(): this is CardComponent<HasHealth> {
		return isHealth(this.props)
	}
	public isHermit(): this is CardComponent<Hermit> {
		return isHermit(this.props)
	}
}

export class StatusEffectComponent<Props extends StatusEffectProps = StatusEffectProps> {
	readonly game: GameModel
	readonly entity: StatusEffectEntity
	readonly statusEffect: StatusEffect<Props>
	public playerId: PlayerId
	public targetEntity: CardEntity
	public counter: number | null

	constructor(
		game: GameModel,
		entity: StatusEffectEntity,
		playerId: PlayerId,
		statusEffect: StatusEffect<Props>,
		targetEntity: CardEntity
	) {
		this.game = game
		this.entity = entity
		this.playerId = playerId
		this.statusEffect = statusEffect
		this.targetEntity = targetEntity
		this.counter = null
	}

	public toLocalStatusEffectInstance(): LocalStatusEffectInstance {
		return {
			props: WithoutFunctions(this.props),
			instance: this.entity,
			targetInstance: this.target.toLocalCardInstance(),
			counter: this.counter,
		}
	}

	public get props(): Props {
		return this.statusEffect.props
	}

	public get target(): CardComponent {
		return this.game.state.cards.getOrThrowError(this.targetEntity)
	}

	public get player(): PlayerState {
		return this.game.state.players[this.playerId]
	}

	public get opponentPlayer(): PlayerState {
		return this.game.state.players[this.game.otherPlayer(this.playerId)]
	}

	public isCounter(): this is StatusEffectComponent<Counter> {
		return isCounter(this.statusEffect.props)
	}
}

export class RowComponent {
	readonly game: GameModel
	readonly entity: RowEntity
	playerId: PlayerId
	index: number
	health: number | null

	constructor(game: GameModel, entity: RowEntity, playerId: PlayerId, index: number) {
		this.game = game
		this.entity = entity
		this.playerId = playerId
		this.index = index
		this.health = null
	}

	get player() {
		return this.game.state.players[this.playerId]
	}

	public damage(amount: number) {
		// Deduct and clamp health
		if (this.health === null) return
		const newHealth = Math.max(this.health - amount, 0)
		this.health = Math.min(newHealth, this.health)
	}

	public heal(amount: number) {
		let hermit = this.game.state.cards.findComponent(card.hermit, card.row(this.entity))
		if (this.health === null) return
		if (!hermit?.isHealth()) return
		this.health = Math.min(this.health + amount, hermit.props.health)
	}
}
export class SlotComponent {
	readonly game: GameModel
	readonly entity: SlotEntity
	readonly playerId: PlayerId | null
	readonly type: SlotTypeT

	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerId | null, type: SlotTypeT) {
		this.entity = entity
		this.game = game
		this.playerId = playerId
		this.type = type
	}

	public onBoard(): this is BoardSlotComponent {
		return false
	}

	public inHand(): this is HandSlotComponent {
		return false
	}

	public inPile(): this is PileSlotComponent {
		return false
	}

	public inDiscardPile(): this is DiscardSlotComponent {
		return false
	}

	get player() {
		if (!this.playerId) return null
		return this.game.state.players[this.playerId]
	}

	get opponentPlayer() {
		if (!this.playerId) return null
		return this.game.state.players[this.game.otherPlayer(this.playerId)]
	}
}

export class BoardSlotComponent extends SlotComponent {
	readonly index: number | null
	readonly rowEntity: RowEntity | null

	constructor(
		game: GameModel,
		entity: SlotEntity,
		playerId: PlayerId | null,
		type: SlotTypeT,
		index: number | null,
		row: RowEntity | null
	) {
		super(game, entity, playerId, type)
		this.index = index
		this.rowEntity = row
	}

	override onBoard(): this is BoardSlotComponent {
		return true
	}

	get row() {
		if (!this.rowEntity) return null
		return this.game.state.rows.get(this.rowEntity)
	}
}

export class HandSlotComponent extends SlotComponent {
	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerId | null) {
		super(game, entity, playerId, 'hand')
	}

	override inHand(): this is HandSlotComponent {
		return true
	}
}

export class PileSlotComponent extends SlotComponent {
	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerId | null) {
		super(game, entity, playerId, 'pile')
	}

	override inPile(): this is PileSlotComponent {
		return true
	}
}

export class DiscardSlotComponent extends SlotComponent {
	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerId | null) {
		super(game, entity, playerId, 'discardPile')
	}

	override inDiscardPile(): this is DiscardSlotComponent {
		return true
	}
}
