import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import CARDS from '../../../cards'
import {GameModel} from '../../../../server/models/game-model'

// TODO - Prevent consecutive use
class PearlescentMoonRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'pearlescentmoon_rare',
			name: 'Pearl',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 300,
			primary: {
				name: 'Cleaning Lady',
				cost: ['terraform'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Aussie Ping',
				cost: ['terraform', 'any'],
				damage: 70,
				power:
					'Opponent flips a coin on their next turn. If heads, their attack misses. Opponent can not miss on consecutive turns.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {currentPlayer, opponentPlayer} = game.ds

		//If pearl's secondary is used, set flag to "secondary_used". However, if the opponent missed the previous turn the flag is unchanged.
		currentPlayer.hooks.onAttack[instance] = (attack) => {
			const instanceKey = this.getInstanceKey(instance)
			if (attack.id !== instanceKey || attack.type !== 'secondary') return
			if (currentPlayer.custom[instanceKey] === 'pearl_opponent_missed') return

			currentPlayer.custom[instanceKey] = 'pearl_secondary_used'
		}

		//Create coin flip on opponent's turn if the flag is set to "secondary_used". If heads, set flag to "opponent_missed".
		opponentPlayer.hooks.onAttack[instance] = (attack) => {
			const instanceKey = this.getInstanceKey(instance)
			if (currentPlayer.custom[instanceKey] !== 'pearl_secondary_used') return

			const coinFlip = flipCoin(opponentPlayer)
			opponentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				attack.multiplyDamage(0)
				currentPlayer.custom[instanceKey] = 'pearl_opponent_missed'
			}
		}

		//If the opponent missed, set the flag to "clear_state" at the end of your turn.
		currentPlayer.hooks.turnEnd[instance] = () => {
			const instanceKey = this.getInstanceKey(instance)
			if (currentPlayer.custom[instanceKey] !== 'pearl_opponent_missed') return

			currentPlayer.custom[instanceKey] = 'pearl_clear_state'
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

export default PearlescentMoonRareHermitCard
