import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {beforeAttack} from '../../../types/priorities'
import {getSupportingItems} from '../../../utils/board'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const SmallishbeansUltraRare: Hermit = {
	...hermit,
	id: 'smallishbeansadvent_ultra_rare',
	numericId: 454,
	name: 'Stratos Joel',
	expansion: 'hc_plus',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 2,
	type: ['pvp'],
	health: 280,
	primary: {
		name: '11ft',
		cost: ['pvp', 'any'],
		damage: 70,
		power: null,
	},
	secondary: {
		name: 'Lore',
		cost: ['pvp', 'pvp', 'any'],
		damage: 30,
		power:
			'Deal 20 extra damage for each item attached. Double items count twice.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				if (!component.slot.inRow()) return

				let total = getSupportingItems(game, component.slot.row).reduce(
					(partialSum, item) => {
						return partialSum + (item.isItem() ? item.props.energy.length : 1)
					},
					0,
				)

				attack.addDamage(component.entity, total * 20)
			},
		)
	},
}

export default SmallishbeansUltraRare
