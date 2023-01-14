export type CardT = {
	cardId: string
	cardInstance: string
}

export type BoardRow = {
	hermitCard: CardT | null
	effectCard: CardT | null
	itemCards: Array<CardT | null>
	health: number | null
}

export type PlayerState = {
	id: string
	playerName: string
	hand: Array<CardT>
	lives: number
	rewards: Array<CardT>
	pile: Array<CardT>
	discarded: Array<CardT>
	board: {
		activeRow: number | null
		rows: Array<BoardRow>
	}
}

export type GameState = {
	turn: number
	players: Record<string, PlayerState>
}
