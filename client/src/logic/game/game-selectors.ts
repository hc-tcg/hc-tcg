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

export const getOpponentName = (state: RootState) => {
	const settings = state.localSettings
	const gameState = getGameState(state)
	const opponentId = getOpponentId(state)
	const opponent = opponentId && gameState?.players[opponentId]

	if (!opponent) return
	if (settings.profanityFilter === 'off') return opponent.playerName
	return opponent.censoredPlayerName
}

export const getOpponentState = (state: RootState) => {
	const playerId = getOpponentId(state)
	return playerId ? getPlayerStateById(playerId)(state) : null
}

export const getCurrentPlayerState = (state: RootState) => {
	const gameState = getGameState(state)
	if (!gameState) return null
	return getPlayerStateById(gameState.turn.currentPlayerId)(state)
}

export const getInactivePlayerState = (state: RootState) => {
	const gameState = getGameState(state)
	if (!gameState) return null
	const currentPlayerId = gameState.turn.currentPlayerId
	const inactiveId = gameState.order.filter((id) => id !== currentPlayerId)[0]
	if (!inactiveId) return null
	return getPlayerStateById(inactiveId)(state)
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
