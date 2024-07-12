import {CARDS} from '../cards'
import Card, {isAttach, isHealth, isHermit, isItem, isSingleUse} from '../cards/base/card'
import type {Attach, CardProps, HasHealth, Hermit, Item, SingleUse} from '../cards/base/card'

import {card} from '../filters'
import type {GameModel} from '../models/game-model'
import {STATUS_EFFECT_CLASSES} from '../status-effects'
import type {Counter, StatusEffectProps} from '../status-effects/status-effect'
import type StatusEffect from '../status-effects/status-effect'
import type {isCounter} from '../status-effects/status-effect'
import type {SlotTypeT} from './cards'
import type {
	CardEntity,
	PlayerEntity,
	PlayerComponent,
	RowEntity,
	SlotEntity,
	StatusEffectEntity,
} from './game-state'
import {LocalCardInstance, LocalStatusEffectInstance, WithoutFunctions} from './server-requests'

export class CardComponent<Props extends CardProps = CardProps> {
	readonly game: GameModel
	readonly card: Card<Props>
	readonly entity: CardEntity
	readonly playerId: PlayerEntity

	slotEntity: SlotEntity | null

	constructor(game: GameModel, entity: CardEntity, id: string, playerId: PlayerEntity) {
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
		for (const card of game.components.filter(CardComponent)) {
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
		return this.game.components.get(this.slotEntity)
	}

	public set slot(component: SlotComponent) {
		this.slotEntity = component.entity
	}

	public get player(): PlayerComponent {
		return this.game.components.getOrError(this.playerId)
	}

	public get opponentPlayer(): PlayerComponent {
		return this.game.components.getOrError(this.game.otherPlayer(this.playerId))
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
	private targetEntity: CardEntity | null
	public playerId: PlayerEntity
	public counter: number | null

	constructor(
		game: GameModel,
		entity: StatusEffectEntity,
		playerId: PlayerEntity,
		statusEffect: string
	) {
		this.game = game
		this.entity = entity
		this.playerId = playerId

		let effect = STATUS_EFFECT_CLASSES[statusEffect]
		if (!effect) {
			throw new Error('Could not create status effect: ' + statusEffect)
		}
		this.statusEffect = effect as any

		this.targetEntity = null
		this.counter = null
	}

	public toLocalStatusEffectInstance(): LocalStatusEffectInstance {
		return {
			props: WithoutFunctions(this.props),
			instance: this.entity,
			targetInstance: this.target?.toLocalCardInstance(),
			counter: this.counter,
		}
	}

	public get props(): Props {
		return this.statusEffect.props
	}

	public get target(): CardComponent | null {
		return this.game.components.get(this.targetEntity)
	}

	public set target(cardEntity: CardEntity | null) {
		let cardComponent = this.game.components.get(cardEntity)
		if (cardComponent) {
			this.statusEffect.onApply(this.game, this, cardComponent)
		}
		this.targetEntity = null
	}

	public get player(): PlayerComponent {
		return this.game.components.getOrError(this.playerId)
	}

	public get opponentPlayer(): PlayerComponent {
		return this.game.components.getOrError(this.game.otherPlayer(this.playerId))
	}

	public isCounter(): this is StatusEffectComponent<Counter> {
		return isCounter(this.statusEffect.props)
	}
}

export class RowComponent {
	readonly game: GameModel
	readonly entity: RowEntity
	playerId: PlayerEntity
	index: number
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

	public damage(amount: number) {
		// Deduct and clamp health
		if (this.health === null) return
		const newHealth = Math.max(this.health - amount, 0)
		this.health = Math.min(newHealth, this.health)
	}

	public heal(amount: number) {
		let hermit = this.game.components.find(CardComponent, card.hermit, card.row(this.entity))
		if (this.health === null) return
		if (!hermit?.isHealth()) return
		this.health = Math.min(this.health + amount, hermit.props.health)
	}
}
export class SlotComponent {
	readonly game: GameModel
	readonly entity: SlotEntity
	readonly playerId: PlayerEntity | null
	readonly type: SlotTypeT

	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerEntity | null, type: SlotTypeT) {
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

	public inDeck(): this is DeckSlotComponent {
		return false
	}

	public inDiscardPile(): this is DiscardSlotComponent {
		return false
	}

	get player() {
		if (!this.playerId) return null
		return this.game.components.getOrError(this.playerId)
	}

	get opponentPlayer() {
		if (!this.playerId) return null
		return this.game.components.get(this.game.otherPlayer(this.playerId))
	}
}

export class BoardSlotComponent extends SlotComponent {
	readonly index: number | null
	readonly rowEntity: RowEntity | null

	constructor(
		game: GameModel,
		entity: SlotEntity,
		playerId: PlayerEntity | null,
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
		return this.game.components.get(this.rowEntity)
	}
}

export class HandSlotComponent extends SlotComponent {
	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerEntity | null) {
		super(game, entity, playerId, 'hand')
	}

	override inHand(): this is HandSlotComponent {
		return true
	}
}

type DeckPosition =
	| {position: 'random'}
	| {position: 'front'}
	| {position: 'back'}
	| {position: 'before'; spot: DeckSlotComponent}
	| {position: 'after'; spot: DeckSlotComponent}

export class DeckSlotComponent extends SlotComponent {
	order: number = 1000

	constructor(
		game: GameModel,
		entity: SlotEntity,
		playerId: PlayerEntity | null,
		position: DeckPosition
	) {
		super(game, entity, playerId, 'deck')

		if (position.position == 'random') {
			this.order = Math.random()
		} else if (position.position == 'front') {
			this.order = 0
		} else if (position.position == 'back') {
			this.order = 0
		} else if (position.position == 'before') {
			this.order = 0
		} else if (position.position == 'after') {
			this.order = 0
		}
	}

	override inDeck(): this is DeckSlotComponent {
		return true
	}
}

export class DiscardSlotComponent extends SlotComponent {
	constructor(game: GameModel, entity: SlotEntity, playerId: PlayerEntity | null) {
		super(game, entity, playerId, 'discardPile')
	}

	override inDiscardPile(): this is DiscardSlotComponent {
		return true
	}
}
