import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class EthosLabUltraRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'ethoslab_ultra_rare',
			name: 'Etho',
			rarity: 'ultra_rare',
			hermitType: 'pvp',
			health: 250,
			primary: {
				name: 'Ladders',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Slab',
				cost: ['any', 'any'],
				damage: 70,
				power: 'Flip a coin 3 times.\n\nAdd an additional 20hp damage for every heads.',
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

			const coinFlip = flipCoin(player, this.id, 3)
			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			attack.addDamage(headsAmount * 20)
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

export default EthosLabUltraRareHermitCard
