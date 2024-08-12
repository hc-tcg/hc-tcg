import {ViewerComponent} from 'common/components/viewer-component'
import {GameModel} from 'common/models/game-model'
import {PlayerId} from 'common/models/player-model'
import {GamePlayerEndOutcomeT} from 'common/types/game-state'
import {getOpponentId} from '../utils'

////////////////////////////////////////
// @TODO sort this whole thing out properly
/////////////////////////////////////////

export const getGameOutcome = (game: GameModel, endResult: any) => {
	if (Object.hasOwn(endResult, 'timeout')) return 'timeout'
	if (Object.hasOwn(endResult, 'forfeit')) return 'forfeit'
	if (Object.hasOwn(endResult, 'playerRemoved')) return 'forfeit'
	if (game.endInfo.deadPlayerEntities.length === 2) return 'tie'
	return 'player_won'
}

export const getGamePlayerOutcome = (
	game: GameModel,
	endResult: any,
	playerId: PlayerId,
): GamePlayerEndOutcomeT => {
	if (Object.hasOwn(endResult, 'timeout')) return 'timeout'
	if (Object.hasOwn(endResult, 'forfeit')) {
		const triggerPlayerId = endResult.forfeit.playerId
		return triggerPlayerId === playerId ? 'forfeit_loss' : 'forfeit_win'
	}
	if (Object.hasOwn(endResult, 'playerRemoved')) {
		const triggerPlayerId = endResult.playerRemoved.payload.id
		return triggerPlayerId === playerId ? 'leave_loss' : 'leave_win'
	}
	if (game.endInfo.deadPlayerEntities.length === 2) return 'tie'
	const deadPlayerEntity = game.endInfo.deadPlayerEntities[0]
	if (!deadPlayerEntity) return 'unknown'

	let deadPlayer = game.components.find(
		ViewerComponent,
		(_game, viewer) =>
			!viewer.spectator && viewer.playerOnLeft.entity === deadPlayerEntity,
	)
	if (!deadPlayer) return 'unknown'

	if (deadPlayer.playerId === playerId) return 'you_lost'
	return 'you_won'
}

export const getWinner = (game: GameModel, endResult: any) => {
	if (Object.hasOwn(endResult, 'timeout')) return null
	if (Object.hasOwn(endResult, 'forfeit')) {
		return getOpponentId(game, endResult.forfeit.playerId)
	}
	if (Object.hasOwn(endResult, 'playerRemoved')) {
		return getOpponentId(game, endResult.playerRemoved.player.id)
	}
	if (game.endInfo.deadPlayerEntities.length === 2) return null
	const deadPlayerEntity = game.endInfo.deadPlayerEntities[0]
	if (!deadPlayerEntity) return null
	let deadPlayer = game.components.find(
		ViewerComponent,
		(_game, viewer) =>
			!viewer.spectator && viewer.playerOnLeft.entity === deadPlayerEntity,
	)
	if (!deadPlayer) return null
	return getOpponentId(game, deadPlayer.playerId)
}
