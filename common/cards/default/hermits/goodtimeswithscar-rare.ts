import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {DeathloopReady, RevivedByDeathloopEffect} from '../../../status-effects/death-loop'

class GoodTimesWithScarRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'goodtimeswithscar_rare',
		numericId: 33,
		name: 'Scar',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		type: 'builder',
		health: 270,
		primary: {
			name: 'Scarred For Life',
			cost: ['builder'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Deathloop',
			cost: ['builder', 'any'],
			damage: 70,
			power:
				'If this Hermit is knocked out before the start of your next turn, they are revived with 50hp.\nDoes not count as a knockout. This Hermit can only be revived once using this ability.',
		},
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'knockout',
			},
		],
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			// If this component is not blocked from reviving, make possible next turn
			if (component.hasStatusEffect(DeathloopReady, RevivedByDeathloopEffect)) return

			game.components
				.new(StatusEffectComponent, DeathloopReady, component.entity)
				.apply(component.entity)
		})
	}
}

export default GoodTimesWithScarRare
