export type PlatyerId = string

export type CardT = {
	cardId: string
	cardInstance: string
}

export type Ailment = {
	id: 'poison' | 'fire' | 'sleeping' | 'knockedout' | 'slowness'
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

export type CoinFlipT = 'heads' | 'tails'

export type CurrentCoinFlipT = {
	name: string
	tosses: Array<CoinFlipT>
}

export type PlayerState = {
	id: PlatyerId
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
}

export type GameState = {
	turn: number
	turnPlayerId: string
	turnTime: number
	turnRemaining: number
	order: Array<PlatyerId>
	players: Record<string, PlayerState>
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

export type GameStatePayload = {
	gameState: GameState
	availableActions: Array<AvailableActionT>
	opponentId: string
}

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
