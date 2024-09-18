import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {beforeAttack} from '../../../types/priorities'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const OverseerRare: Hermit = {
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

				const targetHermit = attack.target?.getHermit()
				if (targetHermit?.isHermit() && targetHermit.props.type === 'farm')
					attack.multiplyDamage(component.entity, 2)
			},
		)
	},
}

export default OverseerRare
