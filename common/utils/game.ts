import {GameModel} from '../models/game-model'
import {TurnAction, PlayerState} from '../types/game-state'

export function isActive(playerState: PlayerState): boolean {
	return playerState.board.activeRow !== null
}
