import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import type {CardCategoryT, PlayCardLog} from '../../types/cards'

export const card = {
	onCreate(_game: GameModel, _component: CardComponent) {},
	onAttach(
		_game: GameModel,
		_component: CardComponent,
		_observer: ObserverComponent,
	) {},
	onDetach(
		_game: GameModel,
		_component: CardComponent,
		_observer: ObserverComponent,
	) {},
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
