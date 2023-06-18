import {AttackModel} from '../../server/models/attack-model'
import {GameModel} from '../../server/models/game-model'
import {AttackResult} from './attack'
import {CardPos, EnergyT} from './cards'
import {MessageInfoT} from './chat'
import {PickProcessT, PickedSlots} from './pick-process'

export type PlayerId = string

export type CardT = {
	cardId: string
	cardInstance: string
}

export type Ailment = {
	id: 'poison' | 'fire' | 'sleeping' | 'knockedout' | 'slowness' | 'badomen'
	duration: number
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

export type RowInfo = {
	index: number
	row: RowStateWithHermit
}

export type CoinFlipT = 'heads' | 'tails'

export type CurrentCoinFlipT = {
	name: string
	tosses: Array<CoinFlipT>
	iterations: Array<string>
}

export type Hook<T> = Record<string, T>

export type PlayerState = {
	id: PlayerId
	followUp?: any
	playerName: string
	censoredPlayerName: string
	coinFlips: Record<string, Array<CoinFlipT>>
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
		/** Instance key -> hook that modifies available energy from item cards */
		availableEnergy: Hook<(availableEnergy: Array<EnergyT>) => Array<EnergyT>>

		/** Instance key -> hook that modifies blockedActions */
		blockedActions: Hook<
			(
				blockedActions: AvailableActionsT,
				pastTurnActions: AvailableActionsT,
				availableEnergy: Array<EnergyT>
			) => AvailableActionsT
		>
		/** Instance key -> hook that modifies availableActions */
		availableActions: Hook<
			(
				availableActions: AvailableActionsT,
				pastTurnActions: AvailableActionsT,
				availableEnergy: Array<EnergyT>
			) => AvailableActionsT
		>

		/** Instance key -> hook called whenver any card is attached */
		onAttach: Hook<(instance: string) => void>
		/** Instance key -> hook called whenver any card is detached */
		onDetach: Hook<(instance: string) => void>
		/** Instance key -> hook called whenever a single use card is applied */
		onApply: Hook<(instance: string) => void>

		/** Instance key -> hook that returns attacks */
		getAttacks: Hook<(pickedSlots: PickedSlots) => Array<AttackModel>>
		/** Instance key -> hook that modifies an attack before the main attack loop */
		beforeAttack: Hook<(attack: AttackModel, pickedSlots: PickedSlots) => void>
		/** Instance key -> hook that modifies an attack during the main attack loop */
		onAttack: Hook<(attack: AttackModel, pickedSlots: PickedSlots) => void>
		/** Instance key -> hook that modifies an attack */
		afterAttack: Hook<(attackResult: AttackResult) => void>

		/** Instance key -> hook called on follow up */
		onFollowUp: Hook<(followUp: string, pickedSlots: PickedSlots) => void>
		/** Instance key -> hook called when follow up times out */
		onFollowUpTimeout: Hook<(followUp: string) => void>

		/** Instance key -> hook called when a hermit is about to die */
		onHermitDeath: Hook<(hermitPos: CardPos) => void>

		/** Instance key -> hook called at the start of the turn */
		onTurnStart: Hook<() => void>
		/** Instance key -> hook called at the end of the turn */
		onTurnEnd: Hook<() => void>

		/** Instance key -> hook called the player flips a coin */
		onCoinFlip: Hook<
			(id: string, coinFlips: Array<CoinFlipT>) => Array<CoinFlipT>
		>
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
	followUp?: any
	playerName: string
	censoredPlayerName: string
	coinFlips: Record<string, Array<CoinFlipT>>
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

export type CoinFlipInfo = {
	shownCoinFlips: Array<string>
	turn: number
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
