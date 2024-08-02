import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class TinFoilChefRare extends Card {
	props: Hermit = {
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

			const coinFlip = flipCoin(player, component)
			if (coinFlip[0] === 'tails') return

			game.currentPlayer.draw(1)
		})
	}
}

export default TinFoilChefRare
