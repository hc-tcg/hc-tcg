import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const FarmerBeefRare: Hermit = {
	...hermit,
	id: 'farmerbeef_rare',
	numericId: 48,
	name: 'Farmer Beef',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 0,
	type: 'farm',
	health: 290,
	primary: {
		name: 'Rustic',
		cost: ['farm'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Hoe down',
		cost: ['farm', 'farm'],
		damage: 80,
		power: 'Attack damage doubles versus Builder types.',
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

				const hermit = attack.target?.getHermit()
				if (!hermit) return
				if (!hermit.isHermit() || hermit.props.type !== 'builder') return

				attack.multiplyDamage(component.entity, 2)
			},
		)
	},
}

export default FarmerBeefRare
