import CARDS, {
	ITEM_CARDS,
	EFFECT_CARDS,
	SINGLE_USE_CARDS,
} from '../../common/cards'
import {DEBUG_CONFIG} from '../../config'
import {GameModel} from '../models/game-model'
import {getCardPos} from './cards'

/**
 * @typedef {import('common/types/game-state').PlayerState} PlayerState
 * @typedef {import('common/types/game-state').CoinFlipT} CoinFlipT
 */

/**
 * @param {CardT | null} card1
 * @param {CardT | null} card2
 */
export function equalCard(card1, card2) {
	if (!card1 || !card2) return false
	return (
		card1.cardId === card2.cardId && card1.cardInstance === card2.cardInstance
	)
}

export function hasEnoughItems(itemCards, cost) {
	const itemCardIds = itemCards.map((card) => card.cardId)
	// transform item cards into cost
	// ['eye_of_ender_2x', 'oak_stairs'] -> ['speedrunner', 'speedrunner', 'builder']
	const energy = itemCardIds.reduce((result, cardId) => {
		const itemCard = ITEM_CARDS[cardId]
		if (!itemCard) return result
		result.push(itemCard.hermitType)
		// all rare item cards are x2
		if (itemCard.rarity === 'rare') {
			result.push(itemCard.hermitType)
		}
		return result
	}, [])

	const specificCost = cost.filter((item) => item !== 'any')
	const anyCost = cost.filter((item) => item === 'any')
	const hasEnoughSpecific = specificCost.every((costItem) => {
		const index = energy.findIndex((energyItem) => energyItem === costItem)
		if (index === -1) return false
		energy.splice(index, 1)
		return true
	})
	if (!hasEnoughSpecific) return false

	// check if remaining energy is enough to cover required "any" cost
	return energy.length >= anyCost.length
}

/**
 * @param {import('common/types/game-state').PlayerState} playerState
 * @param {string} id
 * @param {boolean} isUsed
 */
export function hasSingleUse(playerState, id, isUsed = false) {
	const suCard = playerState.board.singleUseCard
	const suUsed = playerState.board.singleUseCardUsed
	return suCard?.cardId === id && suUsed === isUsed
}

/**
 * @param {GameModel} game
 * @param {import('../../common/types/pick-process').PickedCardsInfo} pickedCardsInfo
 * @returns {boolean}
 */
export function applySingleUse(game, pickedCardsInfo = {}) {
	const {singleUseInfo, currentPlayer} = game.ds

	const suCard = currentPlayer.board.singleUseCard
	if (!suCard) return false

	if (!singleUseInfo) return false
	const cardInstance = currentPlayer.board.singleUseCard?.cardInstance
	if (!cardInstance) return false

	currentPlayer.board.singleUseCardUsed = true

	// Now call methods and hooks

	// Apply effect
	singleUseInfo.onApply(game, cardInstance, pickedCardsInfo)

	// Call applyEffect hook
	const applyEffectHooks = Object.values(currentPlayer.hooks.onApply)
	for (let i = 0; i < applyEffectHooks.length; i++) {
		applyEffectHooks[i](cardInstance)
	}

	return true
}

/*
Return reference to the object holding the card and key at which it is located
Looks only through hand and item/effect/hermit slots.
*/
/**
 * @param {import('common/types/game-state').GameState} gameState
 * @param {CardT | null} card
 */
export function findCard(gameState, card) {
	const pStates = Object.values(gameState.players)
	for (let pState of pStates) {
		const playerId = pState.id
		const handIndex = pState.hand.findIndex((handCard) =>
			equalCard(handCard, card)
		)
		if (handIndex !== -1) return {playerId, target: pState.hand, key: handIndex}

		const rows = pState.board.rows
		for (let row of rows) {
			if (equalCard(row.hermitCard, card))
				return {playerId, target: row, key: 'hermitCard'}
			if (equalCard(row.effectCard, card))
				return {playerId, target: row, key: 'effectCard'}
			const itemIndex = row.itemCards.findIndex((itemCard) =>
				equalCard(itemCard, card)
			)
			if (itemIndex !== -1)
				return {playerId, target: row.itemCards, key: itemIndex}
		}
	}
	return null
}

/**
 * @param {GameModel} game
 * @param {CardT | null} card
 */
export function discardCard(game, card) {
	if (!card) return
	const loc = findCard(game.state, card)
	if (!loc) {
		const err = new Error()
		console.log('Cannot find card: ', card, err.stack)
		return
	}

	const cardInfo = CARDS[card.cardId]
	cardInfo.onDetach(game, card.cardInstance)

	// Call onDetach hook
	const player = getCardPos(game, card.cardInstance)?.playerState
	if (player) {
		const onDetachs = Object.values(player.hooks.onAttach)
		for (let i = 0; i < onDetachs.length; i++) {
			onDetachs[i](card.cardInstance)
		}
	}

	loc.target[loc.key] = null
	Object.values(game.state.players).forEach((pState) => {
		pState.hand = pState.hand.filter(Boolean)
	})

	game.state.players[loc.playerId].discarded.push({
		cardId: card.cardId,
		cardInstance: card.cardInstance,
	})
}

/**
 * @param {GameModel} game
 * @param {PlayerState} playerState
 */
export function discardSingleUse(game, playerState) {
	const suCard = playerState.board.singleUseCard
	const suUsed = playerState.board.singleUseCardUsed
	if (!suCard) return

	const cardInfo = SINGLE_USE_CARDS[suCard.cardId]
	cardInfo.onDetach(game, suCard.cardInstance)

	// Call onDetach hook
	const onDetachs = Object.values(playerState.hooks.onAttach)
	for (let i = 0; i < onDetachs.length; i++) {
		onDetachs[i](suCard.cardInstance)
	}

	playerState.board.singleUseCardUsed = false
	playerState.board.singleUseCard = null

	if (suUsed) {
		const result = game.hooks.discardCard.get('single_use')?.call(suCard, true)
		if (!result) playerState.discarded.push(suCard)
	} else {
		playerState.hand.push(suCard)
	}
}

/**
 * @param {PlayerState} currentPlayer
 * @param {number} times
 * @returns {Array<CoinFlipT>}
 */
export function flipCoin(currentPlayer, times = 1) {
	// TODO - possibly replace with hook to avoid explicit card ids in code
	const fortune = !!currentPlayer.custom['fortune']
	const forceHeads = fortune || DEBUG_CONFIG.forceCoinFlip
	const forceTails = !!currentPlayer.ailments.find((a) => a.id === 'badomen')

	/** @type {Array<CoinFlipT>} */
	const result = []
	for (let i = 0; i < times; i++) {
		if (forceHeads) {
			result.push('heads')
		} else if (forceTails) {
			result.push('tails')
		} else {
			/** @type {CoinFlipT} */
			const coinFlip = Math.random() > 0.5 ? 'heads' : 'tails'
			result.push(coinFlip)
		}
	}
	return result
}

/**
 * @param {GameModel} game
 * @param {string} playerId
 */
export const getOpponentId = (game, playerId) => {
	const players = game.getPlayers()
	return players.filter((p) => p.playerId !== playerId)[0]?.playerId
}

/**
 * @param {PlayerState} playerState
 * @returns {boolean}
 */
export function isActive(playerState) {
	return playerState.board.activeRow !== null
}

/**
 * @param {PlayerState} playerState
 * @returns {RowStateWithHermit[]}
 */
export function getNonEmptyRows(playerState) {
	const rows = []
	for (let row of playerState.board.rows) {
		if (row.hermitCard) rows.push(row)
	}
	return rows
}

/**
 * @param {PlayerState} playerState
 * @param {boolean} includeActive
 * @returns {RowStateWithHermit[]}
 */
export function getRowsWithEmptyItemsSlots(playerState, includeActive = true) {
	const result = []
	const activeRow = playerState.board.activeRow
	const rows = playerState.board.rows
	for (let i = 0; i < rows.length; i++) {
		const row = rows[i]
		if (i === activeRow && !includeActive) continue
		if (row.hermitCard && !isRowFull(row)) result.push(row)
	}
	return result
}

/**
 * @param {RowStateWithHermit} row
 * @returns {boolean}
 */
export function isRowFull(row) {
	return row.itemCards.filter((card) => !!card).length === 3
}

/**
 * @param {RowStateWithHermit} row
 * @returns {boolean}
 */
export function isRowEmpty(row) {
	return row.itemCards.filter((card) => !!card).length === 0
}

/**
 * @param {RowState} row
 * @returns {boolean}
 */
export function rowHasItem(row) {
	return row.itemCards.filter((card) => !!card).length > 0
}
