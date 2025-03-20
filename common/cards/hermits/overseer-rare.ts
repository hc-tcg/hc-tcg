import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const OverseerRare: Hermit = {
	...hermit,
	id: 'overseer_rare',
	numericId: 807,
	name: 'Overseer',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 0,
	type: ['miner'],
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

				const targetHermit = attack.target?.getHermit()
				if (
					targetHermit?.isHermit() &&
					targetHermit.props.type &&
					targetHermit.props.type.includes('farm')
				)
					attack.multiplyDamage(component.entity, 2)
			},
		)
	},
}

export default OverseerRare
