import query from '../../components/query'
import type {CardCategoryT, PlayCardLog} from '../../types/cards'
import {Card, isItem} from './types'

export const card: Card = {
	isItem() {
		return isItem(this.props)
	},
	isHealth(): this is CardOld<CardOld & HasHealth> {
		return isHealth(this.props)
	},
	isHermit(): this is CardOld<CardOld & Hermit> {
		return isHermit(this.props)
	},
	onCreate(_game, _observer) {},
	onAttach(_game, _component, _observer) {},
	onDetach(_game, _component, _observer) {},
}

export const item = {
	...card,
	item: null,
	category: 'item' as CardCategoryT,
	attachCondition: query.every(
		query.slot.currentPlayer,
		query.slot.item,
		query.slot.empty,
		query.slot.row(query.row.hasHermit),
		query.actionAvailable('PLAY_ITEM_CARD'),
		query.not(query.slot.frozen),
	),
	log: (values: PlayCardLog) =>
		`$p{You|${values.player}}$ placed $p${values.pos.name}$ on row #${values.pos.rowIndex}`,
}

export const hermit = {
	...card,
	hermit: null,
	category: 'hermit' as CardCategoryT,
	attachCondition: query.every(
		query.slot.hermit,
		query.slot.currentPlayer,
		query.slot.empty,
		query.actionAvailable('PLAY_HERMIT_CARD'),
		query.not(query.slot.frozen),
	),
	log: (values: PlayCardLog) =>
		`$p{You|${values.player}}$ placed $p${values.pos.name}$ on row #${values.pos.rowIndex}`,
}

export const attach = {
	...card,
	attachable: null,
	category: 'attach' as CardCategoryT,
	attachCondition: query.every(
		query.slot.currentPlayer,
		query.slot.attach,
		query.slot.empty,
		query.slot.row(query.row.hasHermit),
		query.actionAvailable('PLAY_EFFECT_CARD'),
		query.not(query.slot.frozen),
	),
	log: (values: PlayCardLog) =>
		`$p{You|${values.player}}$ placed $p${values.pos.name}$ on row #${values.pos.rowIndex}`,
}

export const singleUse = {
	...card,
	singleUse: null,
	showConfirmationModal: false,
	hasAttack: false,
	category: 'single_use' as CardCategoryT,
	attachCondition: query.every(
		query.slot.singleUse,
		query.slot.playerHasActiveHermit,
		query.actionAvailable('PLAY_SINGLE_USE_CARD'),
	),
}
