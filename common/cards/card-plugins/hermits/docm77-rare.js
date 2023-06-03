import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class Docm77RareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'docm77_rare',
			name: 'Docm77',
			rarity: 'rare',
			hermitType: 'farm',
			health: 280,
			primary: {
				name: 'Shadow Tech',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'World Eater',
				cost: ['farm', 'farm'],
				damage: 80,
				power:
					'Flip a Coin.\n\nIf heads, attack damage doubles.\n\nIf tails, attack damage is halved.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {currentPlayer} = game.ds

		currentPlayer.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance, 'attack')
			if (attack.id !== attackId || attack.type !== 'secondary') return
			
			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				attack.multiplyDamage(2)
			} else {
				attack.multiplyDamage(0.5)
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		const {currentPlayer} = game.ds
		// Remove hooks
		delete currentPlayer.hooks.onAttack[instance]
	}
}

export default Docm77RareHermitCard
