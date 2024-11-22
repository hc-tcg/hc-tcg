import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {beforeAttack} from '../../../types/priorities'
import {hermit} from '../../defaults'
import RendogCommon from '../../hermits/rendog-common'
import RendogRare from '../../hermits/rendog-rare'
import XisumavoidCommon from '../../hermits/xisumavoid-common'
import XisumavoidRare from '../../hermits/xisumavoid-rare'
import {Hermit} from '../../types'

const SantaskallRare: Hermit = {
	...hermit,
	id: 'santaskall_rare',
	numericId: 252,
	name: 'Santaskall',
	expansion: 'advent_of_tcg',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 0,
	type: 'farm',
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

				const hermit = attack.target?.getHermit()
				if (!hermit) return
				if (!hermit.isHermit() || hermit.props.type !== 'builder') return

				attack.multiplyDamage(component.entity, 2)
			},
		)
	},
}

export default SantaskallRare
