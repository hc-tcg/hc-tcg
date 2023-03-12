import CARDS, {ITEM_CARDS} from '../cards'
import {CONFIG, DEBUG_CONFIG} from '../../config'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 * @typedef {import('common/types/game-state').PlayerState} PlayerState
 * @typedef {import('common/types/game-state').CoinFlipT} CoinFlipT
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

export function hasSingleUse(playerState, id, isUsed = false) {
	const suCard = playerState.board.singleUseCard
	const suUsed = playerState.board.singleUseCardUsed
	return suCard?.cardId === id && suUsed === isUsed
}

export function applySingleUse(playerState) {
	const suCard = playerState.board.singleUseCard
	const suUsed = playerState.board.singleUseCardUsed
	if (!suCard) return
	playerState.board.singleUseCardUsed = true
}

/*
Return reference to the object holding the card and key at which it is located
Looks only through hand and item/effect/hermit slots.
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
			let key = null
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

export function discardCard(game, card) {
	const loc = findCard(game.state, card)
	if (!loc) {
		const err = new Error()
		console.log('Cannot find card: ', card, err.stack)
		return
	}

	loc.target[loc.key] = null
	Object.values(game.state.players).forEach((pState) => {
		pState.hand = pState.hand.filter(Boolean)
	})

	const cardInfo = CARDS[card.cardId]
	const result = game.hooks.discardCard.get(cardInfo.type)?.call(card)
	if (result) return

	game.state.players[loc.playerId].discarded.push({
		cardId: card.cardId,
		cardInstance: card.cardInstance,
	})
}

export function discardSingleUse(game, playerState) {
	const suCard = playerState.board.singleUseCard
	const suUsed = playerState.board.singleUseCardUsed
	if (!suCard) return

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
	/** @type {Array<CoinFlipT>} */
	const result = []
	for (let i = 0; i < times; i++) {
		/** @type {CoinFlipT} */
		const coinFlip = fortune ? 'heads' : Math.random() > 0.5 ? 'heads' : 'tails'
		result.push(coinFlip)
	}
	return result
}

export const getOpponentId = (game, playerId) => {
	const players = game.getPlayers()
	return players.filter((p) => p.playerId !== playerId)[0]?.playerId
}
