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

	override onAttach(_game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.beforeAttack.add(component, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const targetHermit = attack.target?.getHermit()
			if (targetHermit?.isHermit() && targetHermit.props.type === 'farm')
				attack.multiplyDamage(component.entity, 2)
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.beforeAttack.remove(component)
	}
}

export default OverseerRare
