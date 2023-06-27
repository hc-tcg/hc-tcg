import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class XisumavoidRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'xisumavoid_rare',
			name: 'Xisuma',
			rarity: 'rare',
			hermitType: 'redstone',
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
				power:
					'Flip a coin. If heads, opponent is now poisoned.\n\nPoison does an additional 20hp damage on your turns.\n\nGoing AFK does not eliminate the poison.',
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
			if (
				attack.id !== attackId ||
				attack.type !== 'secondary' ||
				!attack.target
			)
				return

			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] !== 'heads') return

			const hasDamageEffect = attack.target.row.ailments.some(
				(a) => a.id === 'fire' || a.id === 'poison'
			)
			if (!hasDamageEffect) {
				attack.target.row.ailments.push({id: 'poison'})
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

export default XisumavoidRareHermitCard
