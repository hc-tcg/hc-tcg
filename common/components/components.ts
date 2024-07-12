import type Card from '../cards/base/card'
import type {Attach, CardProps, HasHealth, Hermit, Item, SingleUse} from '../cards/base/interfaces'
import type {GameModel} from '../models/game-model'
import type {Counter, StatusEffectProps} from '../status-effects/status-effect'
import type StatusEffect from '../status-effects/status-effect'
import type {isCounter} from '../status-effects/status-effect'
import type {EnergyT, SlotTypeT} from '../types/cards'
import type {
	CardEntity,
	PlayerEntity,
	RowEntity,
	SlotEntity,
	StatusEffectEntity,
	CurrentCoinFlipT,
	TurnActions,
	CoinFlipT,
} from '../types/game-state'
import type {GameHook, WaterfallHook} from '../types/hooks'
import type {HermitAttackType} from '../types/attack'
import type {AttackModel} from '../models/attack-model'
import type {PlayerId, PlayerModel} from '../models/player-model'

import {isAttach, isHealth, isHermit, isItem, isSingleUse} from '../cards/base/interfaces'
import {Predicate, card} from './query'
import {
	LocalCardInstance,
	LocalStatusEffectInstance,
	PickInfo,
	WithoutFunctions,
} from '../types/server-requests'

export class CardComponent<Props extends CardProps = CardProps> {
	readonly game: GameModel
	readonly card: Card<Props>
	readonly entity: CardEntity
	readonly playerId: PlayerEntity

	slotEntity: SlotEntity | null

	constructor(game: GameModel, entity: CardEntity, card: Card, playerId: PlayerEntity) {
		this.game = game
		this.entity = entity
		this.card = card as Card<Props>
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
		return this.game.components.find(
			PlayerComponent,
			(game, player) => player.entity != this.playerId
		)
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
		statusEffect: StatusEffect
	) {
		this.game = game
		this.entity = entity
		this.playerId = playerId
		this.statusEffect = statusEffect as StatusEffect<Props>
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

export class PlayerComponent {
	readonly game: GameModel
	readonly entity: PlayerEntity

	readonly playerName: string
	readonly minecraftName: string
	readonly censoredPlayerName: string

	readonly id: PlayerId

	coinFlips: Array<CurrentCoinFlipT>
	lives: number
	hasPlacedHermit: boolean
	singleUseCardUsed: boolean

	pickableSlots: Array<PickInfo> | null
	cardsCanBePlacedIn: Array<[CardComponent, Array<PickInfo>]>

	activeRowEntity: RowEntity | null

	hooks: {
		/** Hook that modifies and returns available energy from item cards */
		availableEnergy: WaterfallHook<(availableEnergy: Array<EnergyT>) => Array<EnergyT>>

		/** Hook that modifies and returns blockedActions */
		blockedActions: WaterfallHook<(blockedActions: TurnActions) => TurnActions>

		/** Hook called when a card is attached */
		onAttach: GameHook<(instance: CardComponent) => void>
		/** Hook called when a card is detached */
		onDetach: GameHook<(instance: CardComponent) => void>

		/** Hook called before a single use card is applied */
		beforeApply: GameHook<() => void>
		/** Hook called when a single use card is applied */
		onApply: GameHook<() => void>
		/** Hook called after a single use card is applied */
		afterApply: GameHook<() => void>

		/**
		 * Hook called once before each attack loop.
		 *
		 * This is the place to add pick/modal requests if they need to be resolved before the attack loop.
		 */
		getAttackRequests: GameHook<
			(activeInstance: CardComponent, hermitAttackType: HermitAttackType) => void
		>

		/** Hook that returns attacks to execute */
		getAttack: GameHook<() => AttackModel | null>
		/** Hook called before the main attack loop, for every attack from our side of the board */
		beforeAttack: GameHook<(attack: AttackModel) => void>
		/** Hook called before the main attack loop, for every attack targeting our side of the board */
		beforeDefence: GameHook<(attack: AttackModel) => void>
		/** Hook called for every attack from our side of the board */
		onAttack: GameHook<(attack: AttackModel) => void>
		/** Hook called for every attack that targets our side of the board */
		onDefence: GameHook<(attack: AttackModel) => void>
		/**
		 * Hook called after the main attack loop is completed, for every attack from our side of the board.
		 * Attacks added from this hook will not be executed.
		 *
		 * This is called after actions are marked as completed and blocked
		 */
		afterAttack: GameHook<(attack: AttackModel) => void>
		/**
		 * Hook called after the main attack loop, for every attack targeting our side of the board
		 *
		 * This is called after actions are marked as completed and blocked
		 */
		afterDefence: GameHook<(attack: AttackModel) => void>

		/**
		 * Hook called at the start of the turn
		 *
		 * This is a great place to add blocked actions for the turn, as it's called before actions are calculated
		 */
		onTurnStart: GameHook<() => void>
		/** Hook called at the end of the turn */
		onTurnEnd: GameHook<(drawCards: Array<CardComponent | null>) => void>

		/** Hook called when the player flips a coin */
		onCoinFlip: GameHook<(card: CardComponent, coinFlips: Array<CoinFlipT>) => Array<CoinFlipT>>

		// @TODO eventually to simplify a lot more code this could potentially be called whenever anything changes the row, using a helper.
		/** Hook called before the active row is changed. Returns whether or not the change can be completed. */
		beforeActiveRowChange: GameHook<(oldRow: number | null, newRow: number | null) => boolean>
		/** Hook called when the active row is changed. */
		onActiveRowChange: GameHook<(oldRow: number | null, newRow: number | null) => void>
		/** Hook called when the `slot.locked` combinator is called.
		 * Returns a combinator that verifies if the slot is locked or not.
		 * Locked slots cannot be chosen in some combinator expressions.
		 */
		freezeSlots: GameHook<() => Predicate<SlotComponent>>
	}

	constructor(game: GameModel, entity: PlayerEntity, player: PlayerModel) {
		this.game = game
		this.entity = entity
		this.playerName = player.name
		this.minecraftName = player.minecraftName
		this.censoredPlayerName = player.censoredName
		this.id = player.id
		this.coinFlips = []
		this.lives = 3
		this.hasPlacedHermit = false
		this.singleUseCardUsed = false
		this.cardsCanBePlacedIn = []
		this.pickableSlots = null
		this.activeRowEntity = null

		for (let i = 0; i < DEBUG_CONFIG.extraStartingCards.length; i++) {
			const id = DEBUG_CONFIG.extraStartingCards[i]
			if (!CARDS[id]) {
				console.log('Invalid extra starting card in debug config:', id)
				continue
			}

			let card = game.components.new(CardComponent, id, this.entity)
			card.slot = game.components.new(HandSlotComponent, this.entity)
		}

		this.hooks = {
			availableEnergy: new WaterfallHook<(availableEnergy: Array<EnergyT>) => Array<EnergyT>>(),
			blockedActions: new WaterfallHook<(blockedActions: TurnActions) => TurnActions>(),

			onAttach: new GameHook<(instance: CardComponent) => void>(),
			onDetach: new GameHook<(instance: CardComponent) => void>(),
			beforeApply: new GameHook<() => void>(),
			onApply: new GameHook<() => void>(),
			afterApply: new GameHook<() => void>(),
			getAttackRequests: new GameHook<
				(activeInstance: CardComponent, hermitAttackType: HermitAttackType) => void
			>(),
			getAttack: new GameHook<() => AttackModel | null>(),
			beforeAttack: new GameHook<(attack: AttackModel) => void>(),
			beforeDefence: new GameHook<(attack: AttackModel) => void>(),
			onAttack: new GameHook<(attack: AttackModel) => void>(),
			onDefence: new GameHook<(attack: AttackModel) => void>(),
			afterAttack: new GameHook<(attack: AttackModel) => void>(),
			afterDefence: new GameHook<(attack: AttackModel) => void>(),
			onTurnStart: new GameHook<() => void>(),
			onTurnEnd: new GameHook<(drawCards: Array<CardComponent | null>) => void>(),
			onCoinFlip: new GameHook<
				(card: CardComponent, coinFlips: Array<CoinFlipT>) => Array<CoinFlipT>
			>(),
			beforeActiveRowChange: new GameHook<
				(oldRow: number | null, newRow: number | null) => boolean
			>(),
			onActiveRowChange: new GameHook<(oldRow: number | null, newRow: number | null) => void>(),
			freezeSlots: new GameHook(),
		}
	}

	get opponentPlayer() {
		let player = this.game.components.find(
			PlayerComponent,
			(game, player) => player.entity !== this.entity
		)
		if (!player) throw new Error('Both players should be added to ECS before fetching opponent.')
		return player
	}
}
