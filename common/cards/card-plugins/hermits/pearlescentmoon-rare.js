import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
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
	onAttach(game, instance, pos) {
		const {player, otherPlayer} = pos

		//If pearl's secondary is used, set flag to "secondary_used". However, if the opponent missed the previous turn the flag is unchanged.
		player.hooks.onAttack[instance] = (attack) => {
			const instanceKey = this.getInstanceKey(instance)
			const pearlKey = this.getInstanceKey(instance, 'pearlKey')
			if (attack.id !== instanceKey || attack.type !== 'secondary') return
			if (player.custom[pearlKey] === 'pearl_opponent_missed') return

			player.custom[pearlKey] = 'pearl_secondary_used'
		}

		//Create coin flip on opponent's turn if the flag is set to "secondary_used". If heads, set flag to "opponent_missed".
		otherPlayer.hooks.onAttack[instance] = (attack) => {
			const pearlKey = this.getInstanceKey(instance, 'pearlKey')
			if (player.custom[pearlKey] !== 'pearl_secondary_used') return

			const coinFlip = flipCoin(otherPlayer)
			otherPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				attack.multiplyDamage(0)
				player.custom[pearlKey] = 'pearl_opponent_missed'
			}
		}

		//If the opponent missed, set the flag to "clear_state" at the end of your turn.
		player.hooks.turnEnd[instance] = () => {
			const pearlKey = this.getInstanceKey(instance, 'pearlKey')
			if (player.custom[pearlKey] !== 'pearl_opponent_missed') return

			delete player.custom[pearlKey]
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
