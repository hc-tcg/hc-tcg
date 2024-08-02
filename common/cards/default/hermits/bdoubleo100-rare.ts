import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import {GameModel} from '../../../models/game-model'
import SleepingEffect from '../../../status-effects/sleeping'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class BdoubleO100Rare extends Card {
	props: Hermit = {
		...hermit,
		id: 'bdoubleo100_rare',
		numericId: 1,
		name: 'Bdubs',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		type: 'balanced',
		health: 260,
		primary: {
			name: 'Retexture',
			cost: ['any'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Shreep',
			cost: ['balanced', 'balanced', 'any'],
			damage: 0,
			power:
				'This Hermit restores all HP, then sleeps for the rest of this turn, and the following two turns, before waking up.',
		},
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'sleeping',
			},
		],
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
				.new(StatusEffectComponent, SleepingEffect, component.entity)
				.apply(component.entity)
		})
	}
}

export default BdoubleO100Rare
