import type Card from '../cards/base/card'
import type {Attach, CardProps, HasHealth, Hermit, Item, SingleUse} from '../cards/base/types'
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
import {GameHook, WaterfallHook} from '../types/hooks'
import type {HermitAttackType} from '../types/attack'
import type {AttackModel} from '../models/attack-model'
import type {PlayerId, PlayerModel} from '../models/player-model'

import {DEBUG_CONFIG} from '../config'
import {isAttach, isHealth, isHermit, isItem, isSingleUse} from '../cards/base/types'
import {ComponentQuery, card} from './query'
import {
	LocalCardInstance,
	LocalStatusEffectInstance,
	PickInfo,
	WithoutFunctions,
} from '../types/server-requests'

let STATUS_EFFECTS: Record<any, StatusEffect>
let CARDS: Record<any, Card>

// These are imported lazily to prevent circular imports.
// I am sorry but I have given up.
import('../status-effects').then((mod) => (STATUS_EFFECTS = mod.STATUS_EFFECTS))
import('../cards').then((mod) => (CARDS = mod.CARDS))

export class CardComponent<Props extends CardProps = CardProps> {
	readonly game: GameModel
	readonly card: Card<Props>
	readonly entity: CardEntity
	readonly playerEntity: PlayerEntity

	slotEntity: SlotEntity | null

	constructor(game: GameModel, entity: CardEntity, card: new () => Card, playerId: PlayerEntity) {
		this.game = game
		this.entity = entity
		this.card = CARDS[card.name] as Card<Props>
		this.playerEntity = playerId
		this.slotEntity = null
		this.playerEntity = playerId
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
		return this.game.components.getOrError(this.playerEntity)
	}

	public get opponentPlayer(): PlayerComponent {
		return this.game.components.getOrError(this.game.otherPlayerEntity(this.playerEntity))
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
	public counter: number | null

	constructor(game: GameModel, entity: StatusEffectEntity, statusEffect: new () => StatusEffect) {
		this.game = game
		this.entity = entity
		this.statusEffect = STATUS_EFFECTS[statusEffect.name] as StatusEffect<Props>
		this.targetEntity = null
		this.counter = null
	}

	public toLocalStatusEffectInstance(): LocalStatusEffectInstance {
		if (!this.target) {
			throw new Error('Can not convert to local status effect instance because target is not set')
		}
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

	public get target(): CardComponent | null {
		return this.game.components.get(this.targetEntity)
	}

	public apply(cardEntity: CardEntity | null) {
		let cardComponent = this.game.components.get(cardEntity)
		if (!cardComponent) {
			return
		}
		this.statusEffect.onApply(this.game, this, cardComponent)
	}

	public remove() {
		if (!this.target) return
		this.statusEffect.onRemoval(this.game, this, this.target)
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
export class SlotComponent {
	readonly game: GameModel
	readonly entity: SlotEntity
	readonly playerEntity: PlayerEntity | null
	readonly type: SlotTypeT

	constructor(
		game: GameModel,
		entity: SlotEntity,
		playerEntity: PlayerEntity | null,
		type: SlotTypeT
	) {
		this.entity = entity
		this.game = game
		this.playerEntity = playerEntity
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
		if (!this.playerEntity) return null
		return this.game.components.getOrError(this.playerEntity)
	}

	get opponentPlayer() {
		if (!this.playerEntity) return null
		return this.game.components.get(this.game.otherPlayerEntity(this.playerEntity))
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
		beforeActiveRowChange: GameHook<
			(oldActiveHermit: CardComponent, newActiveHermit: CardComponent) => boolean
		>
		/** Hook called when the active row is changed. */
		onActiveRowChange: GameHook<
			(oldActiveHermit: CardComponent, newActiveHermit: CardComponent) => void
		>
		/** Hook called when the `slot.locked` combinator is called.
		 * Returns a combinator that verifies if the slot is locked or not.
		 * Locked slots cannot be chosen in some combinator expressions.
		 */
		freezeSlots: GameHook<() => ComponentQuery<SlotComponent>>
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
			// if (!CARDS[id]) {
			// 	console.log('Invalid extra starting card in debug config:', id)
			// 	continue
			// }

			let card = game.components.new(CardComponent, id, this.entity)
			card.slot = game.components.new(HandSlotComponent, this.entity)
		}

		this.hooks = {
			availableEnergy: new WaterfallHook<(availableEnergy: Array<EnergyT>) => Array<EnergyT>>(),
			blockedActions: new WaterfallHook<(blockedActions: TurnActions) => TurnActions>(),

			onAttach: new GameHook(),
			onDetach: new GameHook(),
			beforeApply: new GameHook(),
			onApply: new GameHook(),
			afterApply: new GameHook(),
			getAttackRequests: new GameHook(),
			getAttack: new GameHook(),
			beforeAttack: new GameHook(),
			beforeDefence: new GameHook(),
			onAttack: new GameHook(),
			onDefence: new GameHook(),
			afterAttack: new GameHook(),
			afterDefence: new GameHook(),
			onTurnStart: new GameHook(),
			onTurnEnd: new GameHook(),
			onCoinFlip: new GameHook(),
			beforeActiveRowChange: new GameHook(),
			onActiveRowChange: new GameHook(),
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
