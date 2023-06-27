import CARDS from '../../common/cards'
import {GameModel} from '../models/game-model'
import {getCardPos} from './cards'

/**
 * @param {import('common/types/cards').SlotPos} slotPos
 * @returns {boolean}
 */
function isSlotEmpty(slotPos) {
	const {row, slot} = slotPos
	const {index, type} = slot
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
 * @param {import('common/types/cards').SlotPos} slotPos
 * @return {CardT | null}
 */
function getSlotCard(slotPos) {
	const {row, slot} = slotPos
	const {index, type} = slot

	if (type === 'hermit') {
		return row.hermitCard
	} else if (type === 'effect') {
		return row.effectCard
	}

	return row.itemCards[index]
}

/**
 * @param {GameModel} game
 * @param {import('common/types/cards').SlotPos} slotAPos
 * @param {import('common/types/cards').SlotPos} slotBPos
 */
export function swapSlots(game, slotAPos, slotBPos) {
	const {slot: slotA, row: rowA} = slotAPos
	const {slot: slotB, row: rowB} = slotBPos
	if (slotA.type !== slotB.type) return

	// Info about non-empty slots
	let cardsInfo = []

	// onDetach and get card info
	for (const slot of [slotAPos, slotBPos]) {
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
		let tempCard = rowA.hermitCard
		rowA.hermitCard = rowB.hermitCard
		rowB.hermitCard = tempCard
	} else if (slotA.type === 'effect') {
		let tempCard = rowA.effectCard
		rowA.effectCard = rowB.effectCard
		rowB.effectCard = tempCard
	} else if (slotA.type === 'item') {
		let tempCard = rowA.itemCards[slotA.index]
		rowA.itemCards[slotA.index] = rowB.itemCards[slotB.index]
		rowB.itemCards[slotB.index] = tempCard
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
