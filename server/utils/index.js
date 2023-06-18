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
 * @typedef {import("common/types/cards").SlotPos} SlotPos
 */

/**
 * @param {CardT | null} card1
 * @param {CardT | null} card2
 */
export function equalCard(card1, card2) {
	if (!card1 && !card2) return true
	if (!card1 || !card2) return false
	return (
		card1.cardId === card2.cardId && card1.cardInstance === card2.cardInstance
	)
}

/**
 *
 * @param {Array<import('types/cards').EnergyT>} energy
 * @param {Array<import('types/cards').EnergyT>} cost
 * @returns
 */
export function hasEnoughEnergy(energy, cost) {
	const remainingEnergy = energy.slice()

	const specificCost = cost.filter((item) => item !== 'any')
	const anyCost = cost.filter((item) => item === 'any')
	const hasEnoughSpecific = specificCost.every((costItem) => {
		// First try find the exact card
		let index = remainingEnergy.findIndex(
			(energyItem) => energyItem === costItem
		)
		if (index === -1) {
			// Then try find an "any" card
			index = remainingEnergy.findIndex((energyItem) => energyItem === 'any')
			if (index === -1) return
		}
		remainingEnergy.splice(index, 1)
		return true
	})
	if (!hasEnoughSpecific) return false

	// check if remaining energy is enough to cover required "any" cost
	return remainingEnergy.length >= anyCost.length
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
 * @param {import('../../common/types/pick-process').PickedSlots} pickedSlots
 * @param {*} modalResult
 * @returns {boolean}
 */
export function applySingleUse(game, pickedSlots = {}, modalResult = null) {
	const {singleUseInfo, currentPlayer} = game.ds

	const suCard = currentPlayer.board.singleUseCard
	if (!suCard) return false
	const pos = getCardPos(game, suCard.cardInstance)
	if (!pos) return false

	if (!singleUseInfo) return false
	const cardInstance = currentPlayer.board.singleUseCard?.cardInstance
	if (!cardInstance) return false

	currentPlayer.board.singleUseCardUsed = true

	// Now call methods and hooks

	// Apply effect
	singleUseInfo.onApply(game, cardInstance, pos, pickedSlots, modalResult)

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
 * @param {CardT} card
 */
export function moveCardToHand(game, card, steal = false) {
	const cardPos = getCardPos(game, card.cardInstance)
	if (!cardPos || !cardPos.row) return

	const cardInfo = CARDS[card.cardId]
	cardInfo.onDetach(game, card.cardInstance, cardPos)

	const onDetachs = Object.values(cardPos.player.hooks.onDetach)
	for (let i = 0; i < onDetachs.length; i++) {
		onDetachs[i](card.cardInstance)
	}

	if (cardPos.slot.type === 'hermit') {
		cardPos.row.hermitCard = null
	} else if (cardPos.slot.type === 'effect') {
		cardPos.row.effectCard = null
	} else if (cardPos.slot.type === 'item') {
		cardPos.row.itemCards[cardPos.slot.index] = null
	} else if (cardPos.slot.type === 'single_use') {
		cardPos.player.board.singleUseCard = null
	}

	const player = steal ? cardPos.otherPlayer : cardPos.player
	player.hand.push(card)
}

/**
 * @param {GameModel} game
 * @param {CardT | null} card
 */
export function discardCard(game, card) {
	if (!card) return
	const loc = findCard(game.state, card)
	const pos = getCardPos(game, card.cardInstance)
	if (!loc) {
		const err = new Error()
		console.log('Cannot find card: ', card, err.stack)
		return
	}

	// Cards on the Board
	if (pos) {
		const cardInfo = CARDS[card.cardId]
		cardInfo.onDetach(game, card.cardInstance, pos)

		// Call onDetach hook
		const player = getCardPos(game, card.cardInstance)?.player
		if (player) {
			const onDetachs = Object.values(player.hooks.onDetach)
			for (let i = 0; i < onDetachs.length; i++) {
				onDetachs[i](card.cardInstance)
			}
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
 * @param {CardT | null} card
 */
export function retrieveCard(game, card) {
	if (!card) return
	for (let playerId in game.state.players) {
		const player = game.state.players[playerId]
		const discarded = player.discarded
		const index = discarded.findIndex((c) => equalCard(c, card))
		if (index !== -1) {
			const retrievedCard = discarded.splice(index, 1)[0]
			player.hand.push(retrievedCard)
			return
		}
	}
}

/**
 * @param {GameModel} game
 * @param {PlayerState} playerState
 */
export function discardSingleUse(game, playerState) {
	const suCard = playerState.board.singleUseCard
	const suUsed = playerState.board.singleUseCardUsed
	if (!suCard) return
	const pos = getCardPos(game, suCard.cardInstance)
	if (!pos) return

	const cardInfo = SINGLE_USE_CARDS[suCard.cardId]
	cardInfo.onDetach(game, suCard.cardInstance, pos)

	// Call onDetach hook
	const onDetachs = Object.values(playerState.hooks.onDetach)
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
 * @param {PlayerState} playerState
 * @param {number} amount
 */
export function drawCards(playerState, amount) {
	for (let i = 0; i < Math.min(playerState.pile.length, amount); i++) {
		const drawCard = playerState.pile.shift()
		if (drawCard) playerState.hand.push(drawCard)
	}
}

/**
 * @param {PlayerState} currentPlayer
 * @param {number} times
 * @param {string} cardId
 * @returns {Array<CoinFlipT>}
 */
export function flipCoin(currentPlayer, cardId, times = 1) {
	const forceHeads = DEBUG_CONFIG.forceCoinFlip
	const activeRowIndex = currentPlayer.board.activeRow
	if (!activeRowIndex) {
		console.log(
			`${cardId} attempted to flip coin with no active row!, that shouldn't be possible`
		)
		return []
	}
	const forceTails = !!currentPlayer.board.rows[activeRowIndex].ailments.find(
		(a) => a.id === 'badomen'
	)

	/** @type {Array<CoinFlipT>} */
	let coinFlips = []
	for (let i = 0; i < times; i++) {
		if (forceHeads) {
			coinFlips.push('heads')
		} else if (forceTails) {
			coinFlips.push('tails')
		} else {
			/** @type {CoinFlipT} */
			const coinFlip = Math.random() > 0.5 ? 'heads' : 'tails'
			coinFlips.push(coinFlip)
		}
	}

	const coinFlipHooks = Object.values(currentPlayer.hooks.onCoinFlip)
	for (let i = 0; i < coinFlipHooks.length; i++) {
		coinFlips = coinFlipHooks[i](cardId, coinFlips)
	}

	return coinFlips
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
 * @param {CardT} card
 */
export const isRemovable = (card) => {
	const cardInfo = EFFECT_CARDS[card.cardId]
	if (!cardInfo) return false
	return cardInfo.getIsRemovable()
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
 * @returns {RowStateWithHermit | null}
 */
export function getActiveRow(playerState) {
	if (playerState.board.activeRow === null) return null
	const row = playerState.board.rows[playerState.board.activeRow]
	if (!row.hermitCard) return null
	return row
}

/**
 * @param {PlayerState} playerState
 * @param {boolean} includeActive
 * @returns {import('types/game-state').RowInfo[]}
 */
export function getNonEmptyRows(playerState, includeActive = true) {
	/** @type {import('types/game-state').RowInfo[]} */
	const rows = []
	const activeRowIndex = playerState.board.activeRow
	for (let i = 0; i < playerState.board.rows.length; i++) {
		const row = playerState.board.rows[i]
		if (i === activeRowIndex && !includeActive) continue
		if (row.hermitCard) rows.push({index: i, row})
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
 * @param {PlayerState} playerState
 * @returns {Array<RowStateWithHermit[]>}
 */
export function getAdjacentRows(playerState) {
	const result = []
	const rows = playerState.board.rows
	for (let i = 1; i < rows.length; i++) {
		const row = rows[i]
		const prevRow = rows[i - 1]
		if (row && prevRow && row.hermitCard && prevRow.hermitCard)
			result.push([prevRow, row])
	}
	return result
}

/**
 * @param {GameModel} game
 * @param {import('common/types/game-state').AvailableActionT} action
 */
export function isActionAvailable(game, action) {
	return game.turnState.availableActions.includes(action)
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
	const itemCards = row.itemCards
	let total = 0
	for (const itemCard of itemCards) {
		if (!itemCard) continue
		const cardInfo = ITEM_CARDS[itemCard.cardId]
		// String
		if (!cardInfo) continue
		total += 1
	}

	return total > 0
}

/**
 * @param {RowStateWithHermit} row
 * @returns {boolean}
 */
export function rowHasEmptyItemSlot(row) {
	return row.itemCards.filter((card) => !card).length > 0
}

/**
 * @param {GameModel} game
 * @param {RowStateWithHermit} row
 * @returns {number}
 */
export function getItemCardsEnergy(game, row) {
	const itemCards = row.itemCards
	let total = 0
	for (const itemCard of itemCards) {
		if (!itemCard) continue
		const cardInfo = ITEM_CARDS[itemCard.cardId]
		// String
		if (!cardInfo) continue
		const pos = getCardPos(game, itemCard.cardInstance)
		if (!pos) continue
		total += cardInfo.getEnergy(game, itemCard.cardInstance, pos).length
	}

	return total
}
