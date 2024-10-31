import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import {GameModel} from '../../../models/game-model'
import SoulmateEffect, {
	soulmateEffectDamage,
} from '../../../status-effects/soulmate'
import {beforeAttack} from '../../../types/priorities'
import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const BigBSt4tzRare: Hermit = {
	...hermit,
	id: 'bigbst4tz2_rare',
	numericId: 207,
	name: 'BigB',
	expansion: 'advent_of_tcg',
	palette: 'advent_of_tcg',
	background: 'advent_of_tcg',
	rarity: 'rare',
	tokens: 2,
	type: 'speedrunner',
	health: 270,
	primary: {
		name: 'Terry',
		cost: ['speedrunner'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'Soulmate',
		cost: ['speedrunner', 'speedrunner'],
		damage: 80,
		power: `When BigB is knocked out, deal ${soulmateEffectDamage} damage to the opponent's active Hermit.`,
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				game.components
					.new(StatusEffectComponent, SoulmateEffect, component.entity)
					.apply(player.opponentPlayer.entity)
			},
		)
	},
}

export default BigBSt4tzRare
