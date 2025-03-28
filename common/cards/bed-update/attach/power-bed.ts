import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {beforeAttack} from '../../../types/priorities'
import {attach, item} from '../../defaults'
import {Attach} from '../../types'

const PowerBed: Attach = {
	...attach,
	id: 'power_bed',
	numericId: 261,
	name: 'Power Bed',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 1,
	description:
		'Attach as an item. Counts as 3 wild items, but the hermit this card is attached to loses 40 hp each time it attacks.',
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

				component.slot.row.damage(40) //Not damage nor attack.

				const hermitName = game.components.find(
					CardComponent,
					query.card.slot(query.slot.hermit),
					query.card.row(query.row.entity(attack.targetEntity)),
				)?.props.name
				game.battleLog.addEntry(
					player.entity,
					`$p${hermitName}'s$ $ePower Bed$ drained $b40hp$ from its user`,
				)
			},
		)
	},
}

export default PowerBed
