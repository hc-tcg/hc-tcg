import type {CardCategoryT, PlayCardLog} from '../../types/cards'
import * as query from '../../components/query'

export const item = {
	item: null,
	category: 'item' as CardCategoryT,
	attachCondition: query.every(
		query.slot.currentPlayer,
		query.slot.itemSlot,
		query.slot.empty,
		query.slot.row(query.row.hasHermit),
		query.slot.actionAvailable('PLAY_ITEM_CARD'),
		query.not(query.slot.frozen)
	),
	log: (values: PlayCardLog) =>
		`$p{You|${values.player}}$ placed $p${values.pos.name}$ on row #${values.pos.rowIndex}`,
}

export const hermit = {
	hermit: null,
	category: 'hermit' as CardCategoryT,
	attachCondition: query.every(
		query.slot.hermitSlot,
		query.slot.currentPlayer,
		query.slot.empty,
		query.slot.actionAvailable('PLAY_HERMIT_CARD'),
		query.not(query.slot.frozen)
	),
	log: (values: PlayCardLog) =>
		`$p{You|${values.player}}$ placed $p${values.pos.name}$ on row #${values.pos.rowIndex}`,
}

export const attach = {
	attachable: null,
	category: 'attach' as CardCategoryT,
	attachCondition: query.every(
		query.slot.currentPlayer,
		query.slot.attachSlot,
		query.slot.empty,
		query.slot.row(query.row.hasHermit),
		query.slot.actionAvailable('PLAY_EFFECT_CARD'),
		query.not(query.slot.frozen)
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
		query.slot.singleUseSlot,
		query.slot.playerHasActiveHermit,
		query.slot.actionAvailable('PLAY_SINGLE_USE_CARD')
	),
}
