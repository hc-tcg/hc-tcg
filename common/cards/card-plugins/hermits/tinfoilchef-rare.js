import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'
import {getCardPos} from '../../../../server/utils/cards'

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
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance, 'attack')
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] === 'tails') return

			const drawCard = player.pile.shift()
			if (drawCard) player.hand.push(drawCard)
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

export default TinFoilChefRareHermitCard
