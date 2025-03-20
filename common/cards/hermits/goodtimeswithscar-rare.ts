import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import {GameModel} from '../../models/game-model'
import {
	DeathloopReady,
	RevivedByDeathloopEffect,
} from '../../status-effects/death-loop'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const GoodTimesWithScarRare: Hermit = {
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
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				// If this component is not blocked from reviving, make possible next turn
				if (component.getStatusEffect(DeathloopReady, RevivedByDeathloopEffect))
					return

				game.components
					.new(StatusEffectComponent, DeathloopReady, component.entity)
					.apply(component.entity)
			},
		)
	},
}

export default GoodTimesWithScarRare
