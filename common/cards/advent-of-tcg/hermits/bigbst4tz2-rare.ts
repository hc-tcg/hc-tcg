import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import {GameModel} from '../../../models/game-model'
import SoulmateEffect, {
	soulmateEffectDamage,
} from '../../../status-effects/soulmate'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class BigBSt4tzRare extends CardOld {
	props: Hermit = {
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
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return
			game.components
				.new(StatusEffectComponent, SoulmateEffect, component.entity)
				.apply(player.opponentPlayer.entity)
		})
	}
}

export default BigBSt4tzRare
