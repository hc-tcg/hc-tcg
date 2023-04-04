import {RootState} from 'store'
import {LocalGameState} from 'common/types/game-state'
import {getPlayerId} from 'logic/session/session-selectors'

export const getGame = (state: RootState) => {
	return state.game
}

export const getGameState = (state: RootState): LocalGameState | null => {
	return getGame(state).localGameState
}

export const getOpponentId = (state: RootState) => {
	return getGameState(state)?.opponentPlayerId || null
}

export const getTime = (state: RootState) => {
	return getGame(state).time
}

export const getPlayerStates = (state: RootState) => {
	return getGameState(state)?.players || null
}

export const getPlayerStateById = (playerId: string) => (state: RootState) => {
	return getPlayerStates(state)?.[playerId] || null
}

export const getPlayerState = (state: RootState) => {
	const playerId = getPlayerId(state)
	return getPlayerStateById(playerId)(state)
}

export const getOpponentState = (state: RootState) => {
	const playerId = getOpponentId(state)
	return playerId ? getPlayerStateById(playerId)(state) : null
}

export const getCurrentPlayerState = (state: RootState) => {
	const gameState = getGameState(state)
	if (!gameState) return null
	return getPlayerStateById(gameState.currentPlayerId)(state)
}

export const getInactivePlayerState = (state: RootState) => {
	const gameState = getGameState(state)
	if (!gameState) return null
	const currentPlayerId = gameState.currentPlayerId
	const inactiveId = gameState.order.filter((id) => id !== currentPlayerId)[0]
	if (!inactiveId) return null
	return getPlayerStateById(inactiveId)(state)
}

export const getAvailableActions = (state: RootState) => {
	return getGameState(state)?.availableActions || []
}

export const getSelectedCard = (state: RootState) => {
	console.log(getGame(state).selectedCard)
	return getGame(state).selectedCard
}

export const getOpenedModal = (state: RootState) => {
	return getGame(state).openedModal
}

export const getPickProcess = (state: RootState) => {
	return getGame(state).pickProcess
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

export const getOpponentConnection = (state: RootState) => {
	return getGame(state).opponentConnected
}
