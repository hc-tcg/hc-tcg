import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import {GameModel} from '../../models/game-model'
import {TrapHoleEffect} from '../../status-effects/trap-hole'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const HelsknightRare: Hermit = {
	...hermit,
	id: 'helsknight_rare',
	numericId: 102,
	name: 'Helsknight',
	expansion: 'alter_egos',
	palette: 'alter_egos',
	background: 'alter_egos',
	rarity: 'rare',
	tokens: 2,
	type: ['pvp'],
	health: 270,
	primary: {
		name: 'Pitiful',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Trap Hole',
		cost: ['pvp', 'pvp', 'pvp'],
		damage: 100,
		power:
			'If your opponent uses a single use effect card on their next turn, flip a coin.\nIf heads, you take that card after its effect is applied and add it to your hand.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				game.components
					.new(StatusEffectComponent, TrapHoleEffect, component.entity)
					.apply(opponentPlayer.entity)
			},
		)
	},
}

export default HelsknightRare
