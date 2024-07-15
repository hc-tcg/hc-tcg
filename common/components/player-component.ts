import type {GameModel} from '../models/game-model'
import type {PlayerId, PlayerModel} from '../models/player-model'
import type {
	CoinFlipT,
	CurrentCoinFlipT,
	PlayerEntity,
	RowEntity,
	SlotEntity,
	TurnActions,
} from '../types/game-state'
import {CardComponent} from './card-component'
import type {EnergyT} from '../types/cards'
import type {AttackModel} from '../models/attack-model'
import type {HermitAttackType} from '../types/attack'
import type {ComponentQuery} from './query'
import {DEBUG_CONFIG} from '../config'
import {GameHook, WaterfallHook} from '../types/hooks'
import {HandSlotComponent, SlotComponent} from './slot-component'

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

	pickableSlots: Array<SlotEntity> | null
	cardsCanBePlacedIn: Array<[CardComponent, Array<SlotEntity>]>

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
			let slot = game.components.new(HandSlotComponent, this.entity)
			game.components.new(CardComponent, id, slot.entity)
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

	get activeRow() {
		return this.game.components.get(this.activeRowEntity)
	}

	get opponentPlayer() {
		let player = this.game.components.find(
			PlayerComponent,
			(_game, player) => player.entity !== this.entity
		)
		if (!player) throw new Error('Both players should be added to ECS before fetching opponent.')
		return player
	}
}
