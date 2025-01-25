import assert from 'assert'
import {COINS} from '../coins'
import type {PlayerEntity, RowEntity, SlotEntity} from '../entities'
import type {AttackModel} from '../models/attack-model'
import type {GameModel} from '../models/game-model'
import {StatusEffect} from '../status-effects/status-effect'
import type {HermitAttackType} from '../types/attack'
import type {TypeT} from '../types/cards'
import type {
	CoinFlip,
	CurrentCoinFlip,
	TurnActions,
	UsedHermitAttackInfo,
} from '../types/game-state'
import {GameHook, PriorityHook, WaterfallHook} from '../types/hooks'
import {onCoinFlip, onTurnEnd} from '../types/priorities'
import {CardComponent} from './card-component'
import query from './query'
import {RowComponent} from './row-component'
import {SlotComponent} from './slot-component'
import {StatusEffectComponent} from './status-effect-component'

/** The minimal information that must be known about a player to start a game */
export type PlayerDefs = {
	name: string
	minecraftName: string
	censoredName: string
	disableDeckingOut?: true
	selectedCoinHead: keyof typeof COINS
}

export class PlayerComponent {
	readonly game: GameModel
	readonly entity: PlayerEntity

	readonly playerName: string
	readonly minecraftName: string
	readonly censoredPlayerName: string
	readonly selectedCoinHead: keyof typeof COINS

	coinFlips: Array<CurrentCoinFlip>
	lives: number
	hasPlacedHermit: boolean
	singleUseCardUsed: boolean
	deckedOut: boolean
	readonly disableDeckingOut: boolean

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

		/**
		 * Hook called at the start of the turn
		 *
		 * This is a great place to add blocked actions for the turn, as it's called before actions are calculated
		 */
		onTurnStart: GameHook<() => void>
		/** Hook called at the end of the turn */
		onTurnEnd: PriorityHook<
			(drawCards: Array<CardComponent | null>) => void,
			typeof onTurnEnd
		>

		/** Hook called when the player flips a coin */
		onCoinFlip: PriorityHook<
			(card: CardComponent, coinFlips: Array<CoinFlip>) => void,
			typeof onCoinFlip
		>

		// @TODO eventually to simplify a lot more code this could potentially be called whenever anything changes the row, using a helper.
		/** Hook called before the active row is changed. Returns whether or not the change can be completed. */
		beforeActiveRowChange: GameHook<
			(
				oldActiveHermit: CardComponent | null,
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

		/** Hook to block active hermit from being knocked back. */
		blockKnockback: GameHook<() => boolean>
	}

	constructor(game: GameModel, entity: PlayerEntity, player: PlayerDefs) {
		this.game = game
		this.entity = entity
		this.playerName = player.name
		this.minecraftName = player.minecraftName
		this.censoredPlayerName = player.censoredName
		this.selectedCoinHead = player.selectedCoinHead
		this.coinFlips = []
		this.lives = 3
		this.hasPlacedHermit = false
		this.singleUseCardUsed = false
		this.deckedOut = false
		this.disableDeckingOut = !!player.disableDeckingOut
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
			onTurnStart: new GameHook(),
			onTurnEnd: new PriorityHook(onTurnEnd),
			onCoinFlip: new PriorityHook(onCoinFlip),
			beforeActiveRowChange: new GameHook(),
			onActiveRowChange: new GameHook(),
			blockKnockback: new GameHook(),
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
			if (!this.disableDeckingOut) this.deckedOut = true
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

		assert(
			newRow.playerId === this.entity,
			"Should not be able to change to another player's row to make active",
		)

		// Call before active row change hooks - if any of the results are false do not change
		{
			let oldHermit = currentActiveRow ? currentActiveRow.getHermit() : null
			let newHermit = newRow.getHermit()
			if ((currentActiveRow && !oldHermit) || !newHermit)
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
				query.card.slot(query.slot.rowIs(newRow.entity), query.slot.hermit),
			)
			const oldHermit = this.game.components.findEntity(
				CardComponent,
				query.card.slot(
					query.slot.rowIs(currentActiveRow?.entity),
					query.slot.hermit,
				),
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
					'Should not be able to change from no active row to an active row with no hermit.',
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
						card: CardComponent,
						slots: Array<SlotEntity>,
					],
			)
	}

	private lastHermitAttack: null | Array<UsedHermitAttackInfo> = null

	/** Get details about the last hermit attack this player used. */
	public get lastHermitAttackInfo() {
		return this.lastHermitAttack
	}

	public updateLastUsedHermitAttack(attackType: HermitAttackType) {
		if (attackType === 'single-use') return
		const activeHermit = this.getActiveHermit()
		assert(
			activeHermit,
			`${this.playerName} tried to attack without an active hermit`,
		)
		const attackInfo = {
			attackType,
			attacker: activeHermit,
			turn: this.game.state.turn.turnNumber,
		}
		if (this.lastHermitAttack?.[0].turn === attackInfo.turn)
			this.lastHermitAttack.push(attackInfo)
		else this.lastHermitAttack = [attackInfo]
	}

	public canBeKnockedBack() {
		return !this.hooks.blockKnockback.call().some((x) => x)
	}

	public knockback(row: RowComponent) {
		if (this.canBeKnockedBack()) {
			this.changeActiveRow(row)
		}
	}

	/** Create a pick request for knockback. This function will return null if there is no
	 * valid hermit to switch to or the player can not be knocked back.
	 */
	public getKnockbackPickRequest(component: CardComponent) {
		const pickCondition = query.every(
			query.slot.player(this.entity),
			query.slot.hermit,
			query.not(query.slot.active),
			query.not(query.slot.empty),
			query.not(query.slot.frozen),
			query.slot.canBecomeActive,
		)

		if (!component.game.components.exists(SlotComponent, pickCondition))
			return null

		if (!this.canBeKnockedBack()) {
			return null
		}

		return {
			player: this.entity,
			id: component.entity,
			message: 'Choose a new active Hermit from your AFK Hermits',
			canPick: pickCondition,
			onResult: (pickedSlot: SlotComponent) => {
				if (!pickedSlot.inRow()) return
				this.knockback(pickedSlot.row)
			},
			onTimeout: () => {
				const slot = component.game.components.find(
					SlotComponent,
					pickCondition,
				)
				if (!slot?.inRow()) return
				this.knockback(slot.row)
			},
		}
	}
}
