import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class VintageBeefRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'vintagebeef_rare',
			name: 'Beef',
			rarity: 'rare',
			hermitType: 'builder',
			health: 290,
			primary: {
				name: 'Poik',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Beefy Tunes',
				cost: ['builder', 'builder'],
				damage: 80,
				power:
					'Flip a coin. If heads, all status effects are removed from your Hermits.',
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
			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary'
			)
				return

			const coinFlip = flipCoin(player, this.id)
			player.coinFlips[this.id] = coinFlip

			if (coinFlip[0] !== 'heads') return

			player.board.rows.forEach((row) => {
				if (!row.hermitCard) return
				row.ailments = row.ailments.filter(
					(ailment) =>
						!['fire', 'poison', 'badomen', 'weakness'].includes(ailment.id)
				)
			})
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

export default VintageBeefRareHermitCard
