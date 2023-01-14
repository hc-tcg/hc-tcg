export type BoardRow = {
	hermitCard: string | null
	effectCard: string | null
	itemCards: Array<string>
	health: number | null
}

export type PlayerState = {
	id: string
	playerName: string
	hand: Array<string>
	lives: number
	rewards: Array<string>
	pile: Array<string>
	discarded: Array<string>
	board: {
		activeRow: number | null
		rows: Array<BoardRow>
	}
}

export type GameState = {
	turn: number
	players: Record<string, PlayerState>
}
