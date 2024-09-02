import {ViewerComponent} from 'common/components/viewer-component'
import {GameModel} from 'common/models/game-model'
import {PlayerId} from 'common/models/player-model'
import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {GamePlayerEndOutcomeT} from 'common/types/game-state'
import {LocalMessageTable, localMessages} from 'messages'
import {getOpponentId} from '../utils'

////////////////////////////////////////
// @TODO sort this whole thing out properly
// @TODO `getGamePlayerOutcome` and `getWinner` need to properly handle when an AI loses
/////////////////////////////////////////

type EndResult = {
	gameEnd?: unknown
	timeout?: true
	playerRemoved?: LocalMessageTable[typeof localMessages.PLAYER_REMOVED]
	forfeit?: RecievedClientMessage<typeof clientMessages.FORFEIT>
}

export const getGameOutcome = (game: GameModel, endResult: EndResult) => {
	if (Object.hasOwn(endResult, 'timeout')) return 'timeout'
	if (Object.hasOwn(endResult, 'forfeit')) return 'forfeit'
	if (Object.hasOwn(endResult, 'playerRemoved')) return 'forfeit'
	if (game.endInfo.deadPlayerEntities.length === 2) return 'tie'
	return 'player_won'
}

export const getGamePlayerOutcome = (
	game: GameModel,
	endResult: EndResult,
	playerId: PlayerId,
): GamePlayerEndOutcomeT => {
	if (Object.hasOwn(endResult, 'timeout')) return 'timeout'
	if (Object.hasOwn(endResult, 'forfeit')) {
		const triggerPlayerId = endResult.forfeit!.playerId
		return triggerPlayerId === playerId ? 'forfeit_loss' : 'forfeit_win'
	}
	if (Object.hasOwn(endResult, 'playerRemoved')) {
		const triggerPlayerId = endResult.playerRemoved!.player.id
		return triggerPlayerId === playerId ? 'leave_loss' : 'leave_win'
	}
	if (game.endInfo.deadPlayerEntities.length === 2) return 'tie'
	const deadPlayerEntity = game.endInfo.deadPlayerEntities[0]
	if (!deadPlayerEntity) return 'unknown'

	const referencePlayer = game.components.find(
		ViewerComponent,
		(_game, viewer) => viewer.playerId === playerId,
	)
	if (!referencePlayer) return 'unknown'

	if (deadPlayerEntity === referencePlayer.playerOnLeftEntity) return 'you_lost'
	return 'you_won'
}

export const getWinner = (game: GameModel, endResult: EndResult) => {
	if (Object.hasOwn(endResult, 'timeout')) return null
	if (Object.hasOwn(endResult, 'forfeit')) {
		return getOpponentId(game, endResult.forfeit!.playerId)
	}
	if (Object.hasOwn(endResult, 'playerRemoved')) {
		return getOpponentId(game, endResult.playerRemoved!.player.id)
	}
	if (game.endInfo.deadPlayerEntities.length === 2) return null
	const deadPlayerEntity = game.endInfo.deadPlayerEntities[0]
	if (!deadPlayerEntity) return null
	let winner = game.components.find(
		ViewerComponent,
		(_game, viewer) =>
			!viewer.spectator && viewer.playerOnLeft.entity !== deadPlayerEntity,
	)
	if (!winner) return null
	return winner.playerId
}
