import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import {beforeAttack} from '../../../types/priorities'
import {executeExtraAttacks} from '../../../utils/attacks'
import {attach, item} from '../../defaults'
import {Attach} from '../../types'

const PowerBed: Attach = {
	...attach,
	id: 'power_bed',
	numericId: 261,
	name: 'Power Bed',
	expansion: 'beds',
	rarity: 'ultra_rare',
	tokens: 1,
	description:
		'Attach as an item. Counts as 3 wild items, but the hermit this card is attached is drained 40 hp each time it attacks.\nDrained damage ignores effect cards.',
	attachCondition: query.every(
		query.slot.currentPlayer,
		query.slot.item,
		query.slot.empty,
		query.slot.row(query.row.hasHermit),
		query.actionAvailable('PLAY_EFFECT_CARD'),
		query.not(query.slot.frozen),
	),
	log: item.log,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.availableEnergy, (availableEnergy) => {
			if (!component.slot.inRow()) return availableEnergy

			if (player.activeRow?.index !== component.slot.row.index)
				return availableEnergy

			availableEnergy.push('any', 'any', 'any')
			return availableEnergy
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.ADD_ATTACK,
			(attack) => {
				if (!component.slot.inRow() || !component.slot.row.health) return

				if (!attack.isAttacker(component.slot.row.hermitSlot.cardEntity)) return

				const newAttack = new AttackModel(game, {
					attacker: component.entity,
					player: component.player.entity,
					type: 'effect',
					target: component.slot.rowEntity,
					log: (values) =>
						`${values.target}'s ${values.attacker} drained ${values.damage} from it's user.`,
				})
				attack.shouldIgnoreCards.push(
					query.card.slot(query.slot.rowIs(component.slot.rowEntity)),
				)
				newAttack.addDamage(component.entity, 40)
				executeExtraAttacks(game, [newAttack])
			},
		)
	},
}

export default PowerBed
