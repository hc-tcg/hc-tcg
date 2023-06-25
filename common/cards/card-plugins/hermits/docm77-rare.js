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
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, this.id)

			if (coinFlip[0] === 'heads') {
				attack.addDamage(attack.damage)
			} else {
				attack.reduceDamage(attack.damage / 2)
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		// Remove hooks
		delete player.hooks.onAttack[instance]
	}
}

export default Docm77RareHermitCard
