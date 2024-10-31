import {CardComponent, ObserverComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const Iskall85Rare: Hermit = {
	...hermit,
	id: 'iskall85_rare',
	numericId: 48,
	name: 'Iskall',
	expansion: 'default',
	rarity: 'rare',
	tokens: 0,
	type: ['farm'],
	health: 290,
	primary: {
		name: 'Of Doom',
		cost: ['farm'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Bird Poop',
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

				const targetHermit = attack.target?.getHermit()
				if (targetHermit?.isHermit() && targetHermit.props.type && targetHermit.props.type.includes('builder'))
					attack.multiplyDamage(component.entity, 2)
			},
		)
	},
}

export default Iskall85Rare
