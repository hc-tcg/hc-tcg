import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import {GameModel} from '../../../models/game-model'
import OriginalXBEffect from '../../../status-effects/original-xb'
import {beforeAttack} from '../../../types/priorities'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const OriginalXBRare: Hermit = {
	...hermit,
	id: 'originalxb_rare',
	numericId: 164,
	name: 'Original xB',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	type: 'miner',
	health: 270,
	primary: {
		name: "Slabs 'n Stairs",
		cost: ['miner'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Get Good',
		cost: ['miner', 'miner', 'any'],
		damage: 90,
		power:
			'Your opponent must draw an extra card at the end of their next turn.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribeWithPriority(
			player.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				game.components
					.new(StatusEffectComponent, OriginalXBEffect, component.entity)
					.apply(opponentPlayer.entity)
			},
		)
	},
}

export default OriginalXBRare
