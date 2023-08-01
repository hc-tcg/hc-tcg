import {GameModel} from '../models/game-model'
import {AvailableActionT, PlayerState} from '../types/game-state'

export function isActive(playerState: PlayerState): boolean {
	return playerState.board.activeRow !== null
}

export function isActionAvailable(game: GameModel, action: AvailableActionT) {
	return game.turnState.availableActions.includes(action)
}
