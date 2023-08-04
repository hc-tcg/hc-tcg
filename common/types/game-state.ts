import {AttackModel} from '../models/attack-model'
import {CardPosModel} from '../models/card-pos-model'
import {EnergyT} from './cards'
import {MessageInfoT} from './chat'
import {GameHook, WaterfallHook} from './hooks'
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
		blockedActions: WaterfallHook<(blockedActions: TurnActions) => TurnActions>
		/** Hook that modifies and returns availableActions */
		availableActions: WaterfallHook<(availableActions: TurnActions) => TurnActions>

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
		onHermitDeath: GameHook<(hermitPos: CardPosModel) => void>

		/** hook called at the start of the turn */
		onTurnStart: GameHook<() => void>
		/** hook called at the end of the turn */
		onTurnEnd: GameHook<(drawCards: Array<CardT | null>) => void>
		/** hook called when the time runs out*/
		onTurnTimeout: GameHook<(newAttacks: Array<AttackModel>) => void>

		/** hook called the player flips a coin */
		onCoinFlip: GameHook<(id: string, coinFlips: Array<CoinFlipT>) => Array<CoinFlipT>>

		/** hook called when the active Hermit changes */
		onActiveHermitChange: GameHook<(oldRow: number | null, newRow: number) => void>
	}
}

export type GenericActionResult =
	| 'SUCCESS'
	| 'FAILURE_INVALID_DATA'
	| 'FAILURE_NOT_APPLICABLE'
	| 'FAILURE_ACTION_NOT_AVAILABLE'
	| 'FAILURE_CANNOT_COMPLETE'
	| 'FAILURE_UNKNOWN_ERROR'

export type PlayCardActionResult = 'FAILURE_INVALID_SLOT' | 'FAILURE_CANNOT_ATTACH'

export type ActionResult = GenericActionResult | PlayCardActionResult

export type TurnState = {
	turnNumber: number
	currentPlayerId: string
	availableActions: TurnActions
	opponentAvailableActions: TurnActions
	completedActions: TurnActions
}

export type LocalTurnState = {
	turnNumber: number
	currentPlayerId: string
	availableActions: TurnActions
}

export type GameState = {
	turn: TurnState
	order: Array<PlayerId>
	players: Record<string, PlayerState>

	lastActionResult: {
		action: TurnAction
		result: ActionResult
	} | null

	timer: {
		turnTime: number
		turnRemaining: number
	}
}

export type PlayCardAction =
	| 'PLAY_HERMIT_CARD'
	| 'PLAY_ITEM_CARD'
	| 'PLAY_SINGLE_USE_CARD'
	| 'PLAY_EFFECT_CARD'

export type AttackAction = 'ZERO_ATTACK' | 'PRIMARY_ATTACK' | 'SECONDARY_ATTACK'

export type TurnAction =
	| PlayCardAction
	| AttackAction
	| 'END_TURN'
	| 'APPLY_EFFECT'
	| 'REMOVE_EFFECT'
	| 'FOLLOW_UP'
	| 'WAIT_FOR_OPPONENT_FOLLOWUP'
	| 'CHANGE_ACTIVE_HERMIT'
	| 'WAIT_FOR_TURN'

export type GameRules = {
	disableTimer: boolean
}

export type TurnActions = Array<TurnAction>

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
	turn: LocalTurnState
	order: Array<PlayerId>

	// personal data
	hand: Array<CardT>
	pileCount: number
	discarded: Array<CardT>

	// ids
	playerId: PlayerId
	opponentPlayerId: PlayerId

	lastActionResult: {
		action: TurnAction
		result: ActionResult
	} | null

	players: Record<string, LocalPlayerState>

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
