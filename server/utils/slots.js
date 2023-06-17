import CARDS from '../../common/cards'
import {GameModel} from '../models/game-model'
import {getCardPos} from './cards'

/**
 * @param {import('common/types/slots').SlotPos} slotPos
 * @returns {boolean}
 */
function isSlotEmpty(slotPos) {
	const {index, type, row} = slotPos
	if (type === 'hermit') {
		if (!row.hermitCard) return true
	} else if (type === 'effect') {
		if (!row.effectCard) return true
	} else if (type === 'item') {
		if (!row.itemCards[index]) return true
	}

	return false
}

/**
 * @param {import('common/types/slots').SlotPos} slotPos
 * @return {CardT | null}
 */
function getSlotCard(slotPos) {
	const {index, type, row} = slotPos
	if (type === 'hermit') {
		return row.hermitCard
	} else if (type === 'effect') {
		return row.effectCard
	}

	return row.itemCards[index]
}

/**
 * @param {GameModel} game
 * @param {import('common/types/slots').SlotPos} slotA
 * @param {import('common/types/slots').SlotPos} slotB
 */
export function swapSlots(game, slotA, slotB) {
	if (slotA.type !== slotB.type) return

	// Info about non-empty slots
	let cardsInfo = []

	// onDetach and get card info
	for (const slot of [slotA, slotB]) {
		if (isSlotEmpty(slot)) continue

		const card = getSlotCard(slot)
		if (!card) continue

		const cardPos = getCardPos(game, card.cardInstance)
		if (!cardPos) continue

		const cardInfo = CARDS[card.cardId]
		cardInfo.onDetach(game, card.cardInstance, cardPos)

		const onDetachs = Object.values(cardPos.player.hooks.onDetach)
		for (let i = 0; i < onDetachs.length; i++) {
			onDetachs[i](card.cardInstance)
		}

		cardsInfo.push({cardInfo, card})
	}

	// Swap
	if (slotA.type === 'hermit') {
		let tempCard = slotA.row.hermitCard
		slotA.row.hermitCard = slotB.row.hermitCard
		slotB.row.hermitCard = tempCard
	} else if (slotA.type === 'effect') {
		let tempCard = slotA.row.effectCard
		slotA.row.effectCard = slotB.row.effectCard
		slotB.row.effectCard = tempCard
	} else if (slotA.type === 'item') {
		let tempCard = slotA.row.itemCards[slotA.index]
		slotA.row.itemCards[slotA.index] = slotB.row.itemCards[slotB.index]
		slotB.row.itemCards[slotB.index] = tempCard
	}

	// onAttach
	for (let {cardInfo, card} of cardsInfo) {
		// New card position after swap
		const cardPos = getCardPos(game, card.cardInstance)
		if (!cardPos) continue

		cardInfo.onAttach(game, card.cardInstance, cardPos)

		const onAttachs = Object.values(cardPos.player.hooks.onAttach)
		for (let i = 0; i < onAttachs.length; i++) {
			onAttachs[i](card.cardInstance)
		}
	}
}
