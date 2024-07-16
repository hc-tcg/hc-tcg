import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
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
			power: 'Flip a coin.\nIf heads, you draw an extra card at the end of your turn.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			const attackId = this.getInstanceKey(component)
			const attacker = attack.getAttacker()
			if (attack.id !== attackId || attack.type !== 'secondary' || !attacker) return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)
			if (coinFlip[0] === 'tails') return

			const drawCard = player.pile.shift()
			if (drawCard) player.hand.push(drawCard)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		// Remove hooks
		player.hooks.onAttack.remove(component)
	}
}

export default TinFoilChefRare
