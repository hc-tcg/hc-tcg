import {AttackModel} from '../../server/models/attack-model'
import {CardPos, EnergyT} from './cards'
import {MessageInfoT} from './chat'
import {PickProcessT, PickedSlots} from './pick-process'

export type PlayerId = string

export type CardT = {
	cardId: string
	cardInstance: string
}

export type Ailment = {
	id: 'poison' | 'fire' | 'sleeping' | 'knockedout' | 'slowness' | 'badomen' | 'weakness'
	duration?: number
}

export type RowStateWithHermit = {
	hermitCard: CardT
	effectCard: CardT | null
	itemCards: Array<CardT | null>
	health: number
	ailments: Array<Ailment>
}

export type RowStateWithoutHermit = {
	hermitCard: null
	effectCard: null
	itemCards: Array<null>
	health: null
	ailments: Array<Ailment>
}

export type RowState = RowStateWithHermit | RowStateWithoutHermit

export type CoinFlipT = 'heads' | 'tails'

export type CurrentCoinFlipT = {
	name: string
	tosses: Array<CoinFlipT>
}

export class Hook<T extends (...args: any) => any> {
	listeners: Record<string, T> = {}

	/**
	 * Adds a new listener to this hook
	 */
	add(identifier: string, listener: T) {
		this.listeners[identifier] = listener
	}

	/**
	 * Removes the specified listener
	 */
	remove(identifier: string) {
		delete this.listeners[identifier]
	}

	/**
	 * Calls all the added listeners. Returns an array of the results
	 */
	call(...params: Parameters<T>) {
		const results: Array<ReturnType<T>> = []
		const hooks = Object.values(this.listeners)
		for (let i = 0; i < hooks.length; i++) {
			const result = hooks[i](...(params as Array<any>))
			if (result !== undefined) {
				results.push(result)
			}
		}

		return results
	}
}

export class GameHook<T extends (...args: any) => any> extends Hook<(...args: any) => any> {
	listeners: Record<string, T> = {}

	/**
	 * Adds a new listener to this hook
	 */
	add(instance: string, listener: T) {
		this.listeners[instance] = listener
	}

	/**
	 * Removes the specified listener
	 */
	remove(instance: string) {
		delete this.listeners[instance]
	}

	callSome(params: Parameters<T>, ignoreInstance: (instance: string) => boolean) {
		const results: Array<ReturnType<T>> = []
		const instances = Object.keys(this.listeners)
		const hooks = Object.values(this.listeners)
		for (let i = 0; i < instances.length; i++) {
			if (!ignoreInstance(instances[i])) {
				const result = hooks[i](...(params as Array<any>))
				if (result !== undefined) {
					results.push(result)
				}
			}
		}

		return results
	}
}

export class WaterfallHook<T extends (...args: any) => Parameters<T>[0]> {
	listeners: Record<string, T> = {}

	add(instance: string, listener: T) {
		this.listeners[instance] = listener
	}

	remove(instance: string) {
		delete this.listeners[instance]
	}

	call(...params: Parameters<T>): Parameters<T>[0] {
		let newParams = params
		const hooks = Object.values(this.listeners)
		for (let i = 0; i < hooks.length; i++) {
			newParams[0] = hooks[i](...(newParams as Array<any>))
		}

		return newParams[0]
	}
}

export type PlayerState = {
	id: PlayerId
	followUp: Record<string, string>
	playerName: string
	playerDeck: Array<CardT>
	censoredPlayerName: string
	coinFlips: Array<CurrentCoinFlipT>
	custom: Record<string, any>
	hand: Array<CardT>
	lives: number
	pile: Array<CardT>
	discarded: Array<CardT>
	board: {
		activeRow: number | null
		singleUseCard: CardT | null
		singleUseCardUsed: boolean
		rows: Array<RowState>
	}

	hooks: {
		/** Hook that modifies and returns available energy from item cards */
		availableEnergy: WaterfallHook<(availableEnergy: Array<EnergyT>) => Array<EnergyT>>

		/** Hook that modifies and returns blockedActions */
		blockedActions: WaterfallHook<
			(
				blockedActions: AvailableActionsT,
				pastTurnActions: AvailableActionsT,
				availableEnergy: Array<EnergyT>
			) => AvailableActionsT
		>
		/** Hook that modifies and returns availableActions */
		availableActions: WaterfallHook<
			(
				availableActions: AvailableActionsT,
				pastTurnActions: AvailableActionsT,
				availableEnergy: Array<EnergyT>
			) => AvailableActionsT
		>

		/** Hook called when a card is attached */
		onAttach: GameHook<(instance: string) => void>
		/** Hook called when a card is detached */
		onDetach: GameHook<(instance: string) => void>

		/** Hook called before a single use card is applied */
		beforeApply: GameHook<(pickedSlots: PickedSlots, modalResult: any) => void>
		/** Hook called when a single use card is applied */
		onApply: GameHook<(pickedSlots: PickedSlots, modalResult: any) => void>
		/** Hook called after a single use card is applied */
		afterApply: GameHook<(pickedSlots: PickedSlots, modalResult: any) => void>

		/** Hook that returns attacks to execute */
		getAttacks: GameHook<(pickedSlots: PickedSlots) => Array<AttackModel>>
		/** Hook called before the main attack loop, for every attack from our side of the board */
		beforeAttack: GameHook<(attack: AttackModel, pickedSlots: PickedSlots) => void>
		/** Hook called before the main attack loop, for every attack targeting our side of the board */
		beforeDefence: GameHook<(attack: AttackModel, pickedSlots: PickedSlots) => void>
		/** Hook called for every attack from our side of the board */
		onAttack: GameHook<(attack: AttackModel, pickedSlots: PickedSlots) => void>
		/** Hook called for every attack that targets our side of the board */
		onDefence: GameHook<(attack: AttackModel, pickedSlots: PickedSlots) => void>
		/** Hook called after the main attack loop, for every attack from our side of the board */
		afterAttack: GameHook<(attack: AttackModel) => void>
		/** Hook called after the main attack loop, for every attack targeting our side of the board */
		afterDefence: GameHook<(attack: AttackModel) => void>

		/** Hook called on follow up */
		onFollowUp: GameHook<(followUp: string, pickedSlots: PickedSlots, modalResult: any) => void>
		/** Hook called when follow up times out */
		onFollowUpTimeout: GameHook<(followUp: string) => void>

		/**
		 * Hook called when a hermit is about to die.
		 */
		onHermitDeath: GameHook<(hermitPos: CardPos) => void>

		/** hook called at the start of the turn */
		onTurnStart: GameHook<() => void>
		/** hook called at the end of the turn */
		onTurnEnd: GameHook<(drawCards: Array<CardT>) => void>
		/** hook called when the time runs out*/
		onTurnTimeout: GameHook<(newAttacks: Array<AttackModel>) => void>

		/** hook called the player flips a coin */
		onCoinFlip: GameHook<(id: string, coinFlips: Array<CoinFlipT>) => Array<CoinFlipT>>
	}
}

export type GameState = {
	turn: number
	turnPlayerId: string
	order: Array<PlayerId>
	players: Record<string, PlayerState>

	timer: {
		turnTime: number
		turnRemaining: number
	}
}

export type AvailableActionT =
	| 'END_TURN'
	| 'APPLY_EFFECT'
	| 'REMOVE_EFFECT'
	| 'ZERO_ATTACK'
	| 'PRIMARY_ATTACK'
	| 'SECONDARY_ATTACK'
	| 'FOLLOW_UP'
	| 'WAIT_FOR_OPPONENT_FOLLOWUP'
	| 'CHANGE_ACTIVE_HERMIT'
	| 'ADD_HERMIT'
	| 'PLAY_ITEM_CARD'
	| 'PLAY_SINGLE_USE_CARD'
	| 'PLAY_EFFECT_CARD'
	| 'WAIT_FOR_TURN'

export type AvailableActionsT = Array<AvailableActionT>

export type GameEndOutcomeT =
	| 'client_crash'
	| 'server_crash'
	| 'timeout'
	| 'forfeit_win'
	| 'forfeit_loss'
	| 'leave_win'
	| 'leave_loss'
	| 'tie'
	| 'unknown'
	| 'you_won'
	| 'you_lost'
	| null

export type GameEndReasonT = 'hermits' | 'lives' | 'cards' | 'time' | null

export type LocalPlayerState = {
	id: PlayerId
	followUp: Record<string, string>
	playerName: string
	censoredPlayerName: string
	coinFlips: Array<CurrentCoinFlipT>
	custom: Record<string, any>
	lives: number
	board: {
		activeRow: number | null
		singleUseCard: CardT | null
		singleUseCardUsed: boolean
		rows: Array<RowState>
	}
}

export type LocalGameState = {
	turn: number
	order: Array<PlayerId>

	// personal data
	hand: Array<CardT>
	pileCount: number
	discarded: Array<CardT>

	// ids
	playerId: PlayerId
	opponentPlayerId: PlayerId
	currentPlayerId: PlayerId

	players: Record<string, LocalPlayerState>

	pastTurnActions: Array<string>
	availableActions: AvailableActionsT

	timer: {
		turnTime: number
		turnRemaining: number
	}
}

// state sent to client
export type LocalGameRoot = {
	localGameState: LocalGameState | null
	time: number

	selectedCard: CardT | null
	openedModal: {
		id: string
		info: null
	} | null
	pickProcess: PickProcessT | null
	endGameOverlay: {
		reason: GameEndReasonT
		outcome: GameEndOutcomeT
	} | null
	chat: Array<MessageInfoT>
	currentCoinFlip: CurrentCoinFlipT | null
	opponentConnected: boolean
}

export type GameLog = {
	type: 'public' | 'private'
	startHand1: string[]
	startHand2: string[]
	startTimestamp: number
	startDeck: string
}
