import {SlotPos} from '../../common/types/cards'
import CARDS from '../../common/cards'
import {GameModel} from '../models/game-model'
import {getCardPos} from './cards'
import {CardT} from '../../common/types/game-state'

function isSlotEmpty(slotPos: SlotPos): boolean {
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

function getSlotCard(slotPos: SlotPos): CardT | null {
	const {row, slot} = slotPos
	const {index, type} = slot

	if (type === 'hermit') {
		return row.hermitCard
	} else if (type === 'effect') {
		return row.effectCard
	}

	return row.itemCards[index]
}

export function swapSlots(game: GameModel, slotAPos: SlotPos, slotBPos: SlotPos) {
	const {slot: slotA, row: rowA} = slotAPos
	const {slot: slotB, row: rowB} = slotBPos
	if (slotA.type !== slotB.type) return

	// Info about non-empty slots
	let cardsInfo: any = []

	// onDetach and get card info
	for (const slot of [slotAPos, slotBPos]) {
		if (isSlotEmpty(slot)) continue

		const card = getSlotCard(slot)
		if (!card) continue

		const cardPos = getCardPos(game, card.cardInstance)
		if (!cardPos) continue

		const cardInfo = CARDS[card.cardId]
		cardInfo.onDetach(game, card.cardInstance, cardPos)

		cardPos.player.hooks.onDetach.call(card.cardInstance)

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

		cardPos.player.hooks.onAttach.call(card.cardInstance)
	}
}
