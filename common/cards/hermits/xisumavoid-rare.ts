import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import {GameModel} from '../../models/game-model'
import PoisonEffect from '../../status-effects/poison'
import {beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const XisumavoidRare: Hermit = {
	...hermit,
	id: 'xisumavoid_rare',
	numericId: 112,
	name: 'Xisuma',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: 'redstone',
	health: 280,
	primary: {
		name: 'Goodness Me',
		cost: ['redstone'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Cup of Tea',
		cost: ['redstone', 'redstone'],
		damage: 80,
		power: "Flip a coin.\nIf heads, poison your opponent's active Hermit.",
	},
	sidebarDescriptions: [
		{
			type: 'statusEffect',
			name: 'poison',
		},
	],
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const coinFlip = flipCoin(game, player, component)

				if (coinFlip[0] !== 'heads') return

				game.components
					.new(StatusEffectComponent, PoisonEffect, component.entity)
					.apply(opponentPlayer.getActiveHermit()?.entity)
			},
		)
	},
}

export default XisumavoidRare
