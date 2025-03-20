import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import {GameModel} from '../../models/game-model'
import {AussiePingEffect} from '../../status-effects/aussie-ping'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const PearlescentMoonRare: Hermit = {
	...hermit,
	id: 'pearlescentmoon_rare',
	numericId: 85,
	name: 'Pearl',
	expansion: 'default',
	rarity: 'rare',
	tokens: 3,
	type: 'terraform',
	health: 300,
	primary: {
		name: 'Cleaning Lady',
		cost: ['terraform'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Aussie Ping',
		cost: ['terraform', 'any'],
		damage: 70,
		power:
			'If your opponent attacks on their next turn, flip a coin.\nIf heads, their attack misses. Your opponent can not miss due to this ability on consecutive turns.',
	},
	sidebarDescriptions: [
		{
			type: 'glossary',
			name: 'missed',
		},
	],
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
					.new(StatusEffectComponent, AussiePingEffect, component.entity)
					.apply(opponentPlayer.entity)
			},
		)
	},
}

export default PearlescentMoonRare
