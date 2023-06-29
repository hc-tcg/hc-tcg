import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class EthosLabRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'ethoslab_rare',
			name: 'Etho',
			rarity: 'rare',
			hermitType: 'redstone',
			health: 280,
			primary: {
				name: 'Oh Snappers',
				cost: ['redstone'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Blue Fire',
				cost: ['redstone', 'redstone'],
				damage: 80,
				power:
					'Flip a coin. If heads, the opposing Hermit is now burned.\n\nBurn does an additional 20hp damage at the end of your turns.\n\nGoing AFK does not eliminate the burn.',
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
			if (attack.id !== attackId || attack.type !== 'secondary' || !attack.target) return

			const coinFlip = flipCoin(player, this.id)

			if (coinFlip[0] !== 'heads') return

			const hasDamageEffect = attack.target.row.ailments.some(
				(a) => a.id === 'fire' || a.id === 'poison'
			)
			if (!hasDamageEffect) {
				attack.target.row.ailments.push({id: 'fire'})
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

export default EthosLabRareHermitCard
