import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class OverseerRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'overseer_rare',
		numericId: 235,
		name: 'Overseer',
		expansion: 'alter_egos_ii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 0,
		type: 'miner',
		health: 250,
		primary: {
			name: 'Testing',
			cost: ['miner'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Starched',
			cost: ['miner', 'miner'],
			damage: 80,
			power: 'Attack damage doubles versus Farm types.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.beforeAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			const target = attack.getTarget()
			if (attack.id !== attackId || attack.type !== 'secondary' || !target) return

			const isFarmer =
				target.row.hermitCard.isHermit() && target.row.hermitCard.props.type === 'farm' ? 2 : 1

			attack.multiplyDamage(this.props.id, isFarmer)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.beforeAttack.remove(component)
	}
}

export default OverseerRare
