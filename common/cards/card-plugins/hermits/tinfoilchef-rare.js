import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'

class TinFoilChefRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'tinfoilchef_rare',
			name: 'TFC',
			rarity: 'rare',
			hermitType: 'miner',
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
					'Flip a Coin.\n\nIf heads, player draws another card at the end of their turn.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackModel} attack
	 */
	onAttack(game, instance, attack) {
		super.onAttack(game, instance, attack)

		const {currentPlayer} = game.ds
		if (attack.type !== 'secondary') return

		const coinFlip = flipCoin(currentPlayer)
		currentPlayer.coinFlips[this.id] = coinFlip
		if (coinFlip[0] === 'tails') return

		const drawCard = currentPlayer.pile.shift()
		if (drawCard) currentPlayer.hand.push(drawCard)
	}
}

export default TinFoilChefRareHermitCard
