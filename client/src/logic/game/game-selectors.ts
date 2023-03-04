import {RootState} from 'store'
import {GameState} from 'types/game-state'
import {getPlayerId} from 'logic/session/session-selectors'

export const getGame = (state: RootState) => {
	return state.game
}

export const getOpponentId = (state: RootState) => {
	return getGame(state).opponentId
}

export const getGameState = (state: RootState): GameState | null => {
	return getGame(state).gameState
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
	return getPlayerStateById(playerId)(state)
}

export const getCurrentPlayerState = (state: RootState) => {
	const gameState = getGameState(state)
	if (!gameState) return null
	return getPlayerStateById(gameState.turnPlayerId)(state)
}

export const getInactivePlayerState = (state: RootState) => {
	const gameState = getGameState(state)
	if (!gameState) return null
	const turnPlayerId = gameState.turnPlayerId
	const inactiveId = gameState.order.filter((id) => id !== turnPlayerId)[0]
	if (!inactiveId) return null
	return getPlayerStateById(inactiveId)(state)
}

export const getAvailableActions = (state: RootState) => {
	return getGame(state).availableActions
}

export const getSelectedCard = (state: RootState) => {
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

export const getOppopnentConnection = (state: RootState) => {
	return getGame(state).opponentConnected
}
