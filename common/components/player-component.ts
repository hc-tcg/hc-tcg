import type {PlayerEntity, RowEntity, SlotEntity} from '../entities'
import type {AttackModel} from '../models/attack-model'
import type {GameModel} from '../models/game-model'
import {StatusEffect} from '../status-effects/status-effect'
import type {HermitAttackType} from '../types/attack'
import type {TypeT} from '../types/cards'
import type {
	CoinFlipResult,
	CurrentCoinFlip,
	TurnActions,
} from '../types/game-state'
import {GameHook, WaterfallHook} from '../types/hooks'
import {CardComponent} from './card-component'
import query from './query'
import {ComponentQuery} from './query'
import {RowComponent} from './row-component'
import {SlotComponent} from './slot-component'
import {StatusEffectComponent} from './status-effect-component'

/** The minimal information that must be known about a player to start a game */
export type PlayerDefs = {
	name: string
	minecraftName: string
	censoredName: string
}

export class PlayerComponent {
	readonly game: GameModel
	readonly entity: PlayerEntity

	readonly playerName: string
	readonly minecraftName: string
	readonly censoredPlayerName: string

	coinFlips: Array<CurrentCoinFlip>
	lives: number
	hasPlacedHermit: boolean
	singleUseCardUsed: boolean
	deckedOut: boolean

	pickableSlots: Array<SlotEntity> | null

	activeRowEntity: RowEntity | null

	hooks: {
		/** Hook that modifies and returns available energy from item cards */
		availableEnergy: WaterfallHook<
			(availableEnergy: Array<TypeT>) => Array<TypeT>
		>

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
			(
				activeInstance: CardComponent,
				hermitAttackType: HermitAttackType,
			) => void
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
		onCoinFlip: GameHook<
			(
				card: CardComponent,
				coinFlips: Array<CoinFlipResult>,
			) => Array<CoinFlipResult>
		>

		// @TODO eventually to simplify a lot more code this could potentially be called whenever anything changes the row, using a helper.
		/** Hook called before the active row is changed. Returns whether or not the change can be completed. */
		beforeActiveRowChange: GameHook<
			(
				oldActiveHermit: CardComponent,
				newActiveHermit: CardComponent,
			) => boolean
		>
		/** Hook called when the active row is changed. */
		onActiveRowChange: GameHook<
			(
				oldActiveHermit: CardComponent | null,
				newActiveHermit: CardComponent,
			) => void
		>
		/** Hook called when the `slot.locked` combinator is called.
		 * Returns a combinator that verifies if the slot is locked or not.
		 * Locked slots cannot be chosen in some combinator expressions.
		 */
		freezeSlots: GameHook<() => ComponentQuery<SlotComponent>>
	}

	constructor(game: GameModel, entity: PlayerEntity, player: PlayerDefs) {
		this.game = game
		this.entity = entity
		this.playerName = player.name
		this.minecraftName = player.minecraftName
		this.censoredPlayerName = player.censoredName
		this.coinFlips = []
		this.lives = 3
		this.hasPlacedHermit = false
		this.singleUseCardUsed = false
		this.deckedOut = false
		this.pickableSlots = null
		this.activeRowEntity = null

		this.hooks = {
			availableEnergy: new WaterfallHook(),
			blockedActions: new WaterfallHook(),
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
			(_game, player) => player.entity !== this.entity,
		)
		if (!player)
			throw new Error(
				'Both players should be added to ECS before fetching opponent.',
			)
		return player
	}

	/** Get a player's active hermit. */
	public getActiveHermit(): CardComponent | null {
		return this.game.components.find(
			CardComponent,
			query.card.slot(query.slot.hermit),
			query.card.active,
			query.card.player(this.entity),
		)
	}

	/** Get a player's deck */
	public getDeck(): Array<CardComponent> {
		return this.game.components.filter(
			CardComponent,
			query.card.player(this.entity),
			query.card.slot(query.slot.deck),
		)
	}

	/** Get a player's hand */
	public getHand(): Array<CardComponent> {
		return this.game.components.filter(
			CardComponent,
			query.card.player(this.entity),
			query.card.slot(query.slot.hand),
		)
	}

	/** Get a player's discard pile */
	public getDiscarded(): Array<CardComponent> {
		return this.game.components.filter(
			CardComponent,
			query.card.player(this.entity),
			query.card.slot(query.slot.discardPile),
		)
	}

	/** Draw cards from the top of a player's deck. Returns an array of the drawn cards. */
	public draw(amount: number): Array<CardComponent> {
		let cards = this.getDeck().sort(CardComponent.compareOrder).slice(0, amount)
		if (cards.length < amount) {
			this.deckedOut = true
		}
		cards.forEach((card) => card.draw())
		return cards
	}

	public hasStatusEffect(effect: StatusEffect<PlayerComponent>) {
		return this.game.components.find(
			StatusEffectComponent,
			query.effect.is(effect),
			query.effect.targetEntity(this.entity),
		)
	}

	/** Change the active row. Return true if the active row was succesfully changed. */
	public changeActiveRow(newRow: RowComponent | null): boolean {
		const currentActiveRow = this.game.components.get(this.activeRowEntity)

		if (!newRow) return false

		// Can't change to existing active row
		if (newRow === currentActiveRow) return false

		// Call before active row change hooks - if any of the results are false do not change
		if (currentActiveRow) {
			let oldHermit = currentActiveRow.getHermit()
			let newHermit = newRow.getHermit()
			if (!oldHermit || !newHermit)
				throw new Error(
					'Should not be able to change from an active row with no hermits or to an active row with no hermits.',
				)
			const results = this.hooks.beforeActiveRowChange.call(
				oldHermit,
				newHermit,
			)
			if (results.includes(false)) return false
		}

		// Create battle log entry
		if (newRow !== null) {
			const newHermit = this.game.components.findEntity(
				CardComponent,
				query.card.isHermit,
				query.card.slot(query.slot.rowIs(newRow.entity)),
			)
			const oldHermit = this.game.components.findEntity(
				CardComponent,
				query.card.isHermit,
				query.card.slot(query.slot.rowIs(currentActiveRow?.entity)),
			)
			this.game.battleLog.addChangeRowEntry(
				this,
				newRow.entity,
				oldHermit,
				newHermit,
			)
		}

		// Change the active row
		this.activeRowEntity = newRow.entity

		// Call on active row change hooks
		if (currentActiveRow) {
			let oldHermit = currentActiveRow.getHermit()
			let newHermit = newRow.getHermit()
			if (!oldHermit || !newHermit)
				throw new Error(
					'Should not be able to change from an active row with no hermits or to an active row with no hermits.',
				)
			this.hooks.onActiveRowChange.call(oldHermit, newHermit)
		} else {
			let newHermit = newRow.getHermit()
			if (!newHermit)
				throw new Error(
					'Should not be able to change from no active row to an active row with no hermits.',
				)
			this.hooks.onActiveRowChange.call(null, newHermit)
		}

		return true
	}

	/** Get an array of [card, slot the card can be placed in] for each card in the player's hand. */
	public getCardsCanBePlacedIn() {
		return this.game.components
			.filter(
				CardComponent,
				query.card.slot(query.slot.hand, query.slot.player(this.entity)),
			)
			.map(
				(card) =>
					[card, this.game.getPickableSlots(card.props.attachCondition)] as [
						CardComponent,
						Array<SlotEntity>,
					],
			)
	}
}
