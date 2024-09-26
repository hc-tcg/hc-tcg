import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {beforeAttack} from '../../../types/priorities'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const SmallishbeansAdventRare: Hermit = {
	...hermit,
	id: 'smallishbeansadvent_rare',
	numericId: 219,
	name: 'Joel',
	expansion: 'advent_of_tcg',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 2,
	type: 'pvp',
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
		_game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			player.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const activeRow = component.slot.inRow() ? component.slot.row : null
				if (!activeRow) return

				let total = activeRow.getItems().reduce((partialSum, item) => {
					return partialSum + (item.isItem() ? item.props.energy.length : 1)
				}, 0)

				attack.addDamage(component.entity, total * 20)
			},
		)
	},
}

export default SmallishbeansAdventRare
