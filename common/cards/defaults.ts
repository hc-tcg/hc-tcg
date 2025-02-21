import {CardComponent, ObserverComponent, RowComponent} from '../components'
import query from '../components/query'
import {AttackModel} from '../models/attack-model'
import {GameModel} from '../models/game-model'
import {HermitAttackType} from '../types/attack'
import type {CardCategoryT, PlayCardLog} from '../types/cards'
import {FormattedTextNode, formatText} from '../utils/formatting'
import {Attach, Card, Hermit, SingleUse} from './types'

export function getFormattedDescription(
	this: Attach | SingleUse,
): FormattedTextNode {
	return formatText(this.description)
}

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
	/** Gets the log entry for this attack*/
	getLog(this: Card, values: PlayCardLog) {
		if (!this.log) return ''
		return this.log(values)
	},
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
	getAttack(
		this: Hermit,
		game: GameModel,
		component: CardComponent,
		hermitAttackType: HermitAttackType,
	): AttackModel | null {
		if (hermitAttackType === 'single-use') return null

		if (hermitAttackType === 'primary' && this.primary.passive) return null
		if (hermitAttackType === 'secondary' && this.secondary.passive) return null

		const attack = game.newAttack({
			attacker: component.entity,
			target: game.components.findEntity(
				RowComponent,
				query.row.opponentPlayer,
				query.row.active,
			),
			type: hermitAttackType,
			createWeakness: 'ifWeak',
			log: (values) => {
				if (
					values.attack.getDamageMultiplier() === 0 ||
					!values.attack.target?.getHermit()
				) {
					return `${values.attacker} ${values.coinFlip ? values.coinFlip + ', then ' : ''} attacked with ${values.attackName} and missed`
				}
				return `${values.attacker} ${values.coinFlip ? values.coinFlip + ', then ' : ''} attacked ${
					values.target
				} with ${values.attackName} for ${values.damage} damage`
			},
		})

		if (attack.type === 'primary') {
			attack.addDamage(component.entity, this.primary.damage)
		} else if (attack.type === 'secondary') {
			attack.addDamage(component.entity, this.secondary.damage)
		}

		return attack
	},
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
	getFormattedDescription,
}

export const singleUse = {
	...card,
	singleUse: null,
	showConfirmationModal: false,
	hasAttack: false,
	category: 'single_use' as CardCategoryT,
	attachCondition: query.every(
		query.slot.singleUse,
		query.slot.empty,
		query.slot.playerHasActiveHermit,
		query.actionAvailable('PLAY_SINGLE_USE_CARD'),
	),
	getFormattedDescription,
}
