import {CardComponent} from '../../components'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class SmallishbeansAdventRare extends CardOld {
	props: Hermit = {
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
	}

	override onAttach(
		_game: GameModel,
		component: CardComponent,
		_observer: Observer,
	) {
		const {player} = pos

		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const activeRow = getActiveRowPos(player)
			if (!activeRow) return

			let partialSum = 0

			activeRow.row.itemCards.forEach((item) => {
				if (!item || !item.props.id.includes('item')) return
				if (item.props.rarity === 'rare') partialSum += 1
				partialSum += 1
			})

			attack.addDamage(this.props.id, partialSum * 20)
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default SmallishbeansAdventRare
