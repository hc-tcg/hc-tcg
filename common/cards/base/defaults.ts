import type {CardCategoryT, PlayCardLog} from '../../types/cards'
import {query, row, slot} from '../../components/query'

export const item = {
	item: null,
	category: 'item' as CardCategoryT,
	attachCondition: query.every(
		slot.currentPlayer,
		slot.itemSlot,
		slot.empty,
		slot.row(row.hasHermit),
		slot.actionAvailable('PLAY_ITEM_CARD'),
		query.not(slot.frozen)
	),
	log: (values: PlayCardLog) =>
		`$p{You|${values.player}}$ placed $p${values.pos.name}$ on row #${values.pos.rowIndex}`,
}

export const hermit = {
	hermit: null,
	category: 'hermit' as CardCategoryT,
	attachCondition: query.every(
		slot.hermitSlot,
		slot.currentPlayer,
		slot.empty,
		slot.actionAvailable('PLAY_HERMIT_CARD'),
		query.not(slot.frozen)
	),
	log: (values: PlayCardLog) =>
		`$p{You|${values.player}}$ placed $p${values.pos.name}$ on row #${values.pos.rowIndex}`,
}

export const attach = {
	attachable: null,
	category: 'attach' as CardCategoryT,
	attachCondition: query.every(
		slot.currentPlayer,
		slot.attachSlot,
		slot.empty,
		slot.row(row.hasHermit),
		slot.actionAvailable('PLAY_EFFECT_CARD'),
		query.not(slot.frozen)
	),
	log: (values: PlayCardLog) =>
		`$p{You|${values.player}}$ placed $p${values.pos.name}$ on row #${values.pos.rowIndex}`,
}

export const singleUse = {
	singleUse: null,
	showConfirmationModal: false,
	hasAttack: false,
	category: 'single_use' as CardCategoryT,
	attachCondition: query.every(
		slot.singleUseSlot,
		slot.playerHasActiveHermit,
		slot.actionAvailable('PLAY_SINGLE_USE_CARD')
	),
}
