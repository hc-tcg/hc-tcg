export type PlatyerId = string

export type CardT = {
	cardId: string
	cardInstance: string
}

export type BoardRowT = {
	hermitCard: CardT | null
	effectCard: CardT | null
	itemCards: Array<CardT | null>
	health: number | null
	ailments: Array<'poison' | 'fire' | 'sleeping'>
}

export type CoinFlipT = 'heads' | 'tails'

export type PlayerState = {
	id: PlatyerId
	effectStep?: number
	playerName: string
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
	order: Array<PlatyerId>
	players: Record<string, PlayerState>
}
