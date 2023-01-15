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
}

export type PlayerState = {
	id: PlatyerId
	playerName: string
	hand: Array<CardT>
	lives: number
	rewards: Array<CardT>
	pile: Array<CardT>
	discarded: Array<CardT>
	board: {
		activeRow: number | null
		rows: Array<BoardRowT>
	}
}

export type GameState = {
	turn: number
	turnPlayerId: string
	order: Array<PlatyerId>
	players: Record<string, PlayerState>
}
