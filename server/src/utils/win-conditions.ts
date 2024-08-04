import {GameModel} from 'common/models/game-model'
import {getOpponentId} from '../utils'
import {ViewerComponent} from 'common/components/viewer-component'

////////////////////////////////////////
// @TODO sort this whole thing out properly
/////////////////////////////////////////

//@ts-ignore
export const getGameOutcome = (game, endResult) => {
	if (Object.hasOwn(endResult, 'timeout')) return 'timeout'
	if (Object.hasOwn(endResult, 'forfeit')) return 'forfeit'
	if (Object.hasOwn(endResult, 'playerRemoved')) return 'forfeit'
	if (game.endInfo.deadPlayerIds.length === 2) return 'tie'
	return 'player_won'
}

//@ts-ignore
export const getGamePlayerOutcome = (game, endResult, playerId) => {
	if (Object.hasOwn(endResult, 'timeout')) return 'timeout'
	if (Object.hasOwn(endResult, 'forfeit')) {
		const triggerPlayerId = endResult.forfeit.playerId
		return triggerPlayerId === playerId ? 'forfeit_loss' : 'forfeit_win'
	}
	if (Object.hasOwn(endResult, 'playerRemoved')) {
		const triggerPlayerId = endResult.playerRemoved.payload.id
		return triggerPlayerId === playerId ? 'leave_loss' : 'leave_win'
	}
	if (game.endInfo.deadPlayerIds.length === 2) return 'tie'
	const deadId = game.endInfo.deadPlayerIds[0]
	if (!deadId) return 'unknown'
	if (deadId === playerId) return 'you_lost'
	return 'you_won'
}

export const getWinner = (game: GameModel, endResult: any) => {
	if (Object.hasOwn(endResult, 'timeout')) return null
	if (Object.hasOwn(endResult, 'forfeit')) {
		return getOpponentId(game, endResult.forfeit.playerId)
	}
	if (Object.hasOwn(endResult, 'playerRemoved')) {
		return getOpponentId(game, endResult.playerRemoved.payload.id)
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
