import {PlayerEntity} from 'common/entities'
import {LocalGameState} from 'common/types/game-state'
import {RootState} from 'store'

export const getGame = (state: RootState) => {
	return state.game
}

export const getGameState = (state: RootState): LocalGameState | null => {
	return getGame(state).localGameState
}

export const getIsSpectator = (state: RootState): boolean => {
	return getGameState(state)?.isSpectator || false
}

export const getTime = (state: RootState) => {
	return getGame(state).time
}

export const getPlayerStates = (state: RootState) => {
	return getGameState(state)?.players || null
}

export const getPlayerStateByEntity =
	(player?: PlayerEntity) => (state: RootState) => {
		let playerState = getGame(state).localGameState?.players
		if (!player || !playerState) {
			throw new Error(
				'Attempted to get player before state is defined. This should be impossible.',
			)
		}
		return playerState[player]
	}

export const getPlayerEntity = (state: RootState) => {
	let player = getGame(state).localGameState?.playerEntity
	if (!player) {
		throw new Error(
			'Attempted to get player entity before state is defined. This should be impossible.',
		)
	}
	return player
}

export const getOpponentEntity = (state: RootState) => {
	return getGame(state).localGameState?.opponentPlayerEntity
}

export const getPlayerState = (state: RootState) => {
	const player = getPlayerEntity(state)
	return getPlayerStateByEntity(player)(state)
}

export const getOpponentName = (state: RootState) => {
	const settings = state.localSettings
	const gameState = getGameState(state)
	const opponentId = getOpponentEntity(state)
	const opponent = opponentId && gameState?.players[opponentId]

	if (!opponent) return
	if (!settings.profanityFilterEnabled) return opponent.playerName
	return opponent.censoredPlayerName
}

export const getOpponentState = (state: RootState) => {
	const playerEntity = getOpponentEntity(state)
	return getPlayerStateByEntity(playerEntity)(state)
}

export const getCurrentPlayerState = (state: RootState) => {
	const gameState = getGameState(state)
	if (!gameState) return null
	return getPlayerStateByEntity(gameState.turn.currentPlayerEntity)(state)
}

export const getInactivePlayerState = (state: RootState) => {
	const gameState = getGameState(state)
	if (!gameState) return null
	const currentPlayerEntity = gameState.turn.currentPlayerEntity
	let inactivePlayerEntity = [
		gameState.playerEntity,
		gameState.opponentPlayerEntity,
	].filter((id) => id != currentPlayerEntity)[0]
	return getPlayerStateByEntity(inactivePlayerEntity)(state)
}

export const getAvailableActions = (state: RootState) => {
	const gameState = getGameState(state)
	if (!gameState) return []
	return gameState.turn.availableActions
}

export const getSelectedCard = (state: RootState) => {
	return getGame(state).selectedCard
}

export const getOpenedModal = (state: RootState) => {
	return getGame(state).openedModal
}

export const getCardsCanBePlacedIn = (state: RootState) => {
	return getGameState(state)?.currentCardsCanBePlacedIn
}

export const getPickRequestPickableSlots = (state: RootState) => {
	return getGameState(state)?.currentPickableSlots
}

export const getCurrentPickMessage = (state: RootState) => {
	return getGameState(state)?.currentPickMessage || null
}

export const getEndGameOverlay = (state: RootState) => {
	return getGame(state).endGameOverlay
}

export const getChatMessages = (state: RootState) => {
	return getGame(state).chat
}

export const getCurrentCoinFlip = (state: RootState) => {
	return getGame(state).currentCoinFlip
}

export const getBattleLog = (state: RootState) => {
	return getGame(state).battleLog
}

export const getOpponentConnection = (state: RootState) => {
	return getGame(state).opponentConnected
}
