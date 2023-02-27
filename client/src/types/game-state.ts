export type PlatyerId = string

export type CardT = {
	cardId: string
	cardInstance: string
}

export type Ailment = {
	id: 'poison' | 'fire' | 'sleeping' | 'knockedout'
	duration: number
}

export type BoardRowT = {
	hermitCard: CardT | null
	effectCard: CardT | null
	itemCards: Array<CardT | null>
	health: number | null
	ailments: Array<Ailment>
}

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
	rewards: Array<CardT>
	pile: Array<CardT>
	discarded: Array<CardT>
	board: {
		activeRow: number | null
		singleUseCard: CardT | null
		singleUseCardUsed: boolean
		rows: Array<BoardRowT>
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

export type GameStatePayload = {
	gameState: GameState
	availableActions: Array<string>
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
