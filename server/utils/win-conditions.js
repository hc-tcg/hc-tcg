import {getOpponentId} from './index'

export const getGameOutcome = (game, endResult) => {
	if (Object.hasOwn(endResult, 'timeout')) return 'timeout'
	if (Object.hasOwn(endResult, 'forfeit')) return 'forfeit'
	if (Object.hasOwn(endResult, 'playerRemoved')) return 'forfeit'
	if (game.endInfo.deadPlayerIds.length === 2) return 'tie'
	return 'player_won'
}

export const getGamePlayerOutcome = (game, endResult, playerId) => {
	if (Object.hasOwn(endResult, 'timeout')) return 'timeout'
	if (Object.hasOwn(endResult, 'forfeit')) {
		const triggerPlayerId = endResult.forfeit.playerId
		return triggerPlayerId === playerId ? 'forfeit_loss' : 'forfeit_win'
	}
	if (Object.hasOwn(endResult, 'playerRemoved')) {
		const triggerPlayerId = endResult.playerRemoved.payload.playerId
		return triggerPlayerId === playerId ? 'leave_loss' : 'leave_win'
	}
	if (game.endInfo.deadPlayerIds.length === 2) return 'tie'
	const deadId = game.endInfo.deadPlayerIds[0]
	if (!deadId) return 'unknown'
	if (deadId === playerId) return 'you_lost'
	return 'you_won'
}

export const getWinner = (game, endResult) => {
	if (Object.hasOwn(endResult, 'timeout')) return null
	if (Object.hasOwn(endResult, 'forfeit')) {
		return getOpponentId(game, endResult.forfeit.playerId)
	}
	if (Object.hasOwn(endResult, 'playerRemoved')) {
		return getOpponentId(game, endResult.playerRemoved.payload.playerId)
	}
	if (game.endInfo.deadPlayerIds.length === 2) return null
	const deadId = game.endInfo.deadPlayerIds[0]
	if (!deadId) return null
	return getOpponentId(game, deadId)
}
