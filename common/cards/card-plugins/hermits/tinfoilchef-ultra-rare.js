import HermitCard from './_hermit-card'
import {flipCoin, discardCard, isRemovable} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class TinFoilChefUltraRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'tinfoilchef_ultra_rare',
			name: 'TFC',
			rarity: 'ultra_rare',
			hermitType: 'miner',
			health: 300,
			primary: {
				name: 'Phone Call',
				cost: ['miner', 'miner'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Take It Easy',
				cost: ['miner', 'miner', 'miner'],
				damage: 100,
				power:
					'Flip a Coin.\n\nIf heads, opponent is forced to discard effect card attached to active Hermit.\n\nOnly one effect card per opposing Hermit can be discarded.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		player.hooks.beforeAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			if (opponentPlayer.board.activeRow === null) return 'NO'
			const opponentActiveRow =
				opponentPlayer.board.rows[opponentPlayer.board.activeRow]
			if (
				!opponentActiveRow.effectCard ||
				!isRemovable(opponentActiveRow.effectCard)
			)
				return

			// Can't discard two items on the same hermit
			const limit = player.custom[this.getInstanceKey(instance)] || {}
			if (limit[opponentActiveRow.hermitCard.cardInstance]) return

			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] === 'tails') return

			limit[opponentActiveRow.hermitCard.cardInstance] = true
			player.custom[this.getInstanceKey(instance)] = limit

			discardCard(game, opponentActiveRow.effectCard)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos

		delete player.hooks.onAttack[instance]
	}
}

export default TinFoilChefUltraRareHermitCard
