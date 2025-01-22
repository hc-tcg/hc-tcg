import { ObserverComponent } from "../components"
import { GameModel } from "../models/game-model"
import { PlayerModel } from "../models/player-model"

export type Achievement = {
	id: string
	numericId: number
	name: string
	description: string
	steps: number
	getProgress: (data: Buffer<ArrayBuffer>) => number
	sidebarDescriptions?: Array<{type: string; name: string}>

	onGameStart: (game: GameModel, player: PlayerModel, observer: ObserverComponent) => void
	onGameEnd: (game: GameModel, player: PlayerModel) => void
}
