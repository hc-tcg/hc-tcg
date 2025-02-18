import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import {GameModel} from '../../models/game-model'
import GoMiningEffect from '../../status-effects/go-mining'
import {beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const TinFoilChefRare: Hermit = {
	...hermit,
	id: 'tinfoilchef_rare',
	numericId: 98,
	name: 'TFC',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: 'miner',
	health: 300,
	primary: {
		name: 'True Hermit',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Branch Mine',
		cost: ['miner', 'miner'],
		damage: 80,
		power:
			'Flip a coin.\nIf heads, you draw an extra card at the end of your turn.',
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

				const coinFlip = flipCoin(game, player, component)
				if (coinFlip[0] === 'tails') return

				game.components
					.new(StatusEffectComponent, GoMiningEffect, component.entity)
					.apply(player.entity)
			},
		)
	},
}

export default TinFoilChefRare
