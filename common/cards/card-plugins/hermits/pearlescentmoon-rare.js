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
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, otherPlayer} = pos
		const status = this.getInstanceKey(instance, 'status')

		//If pearl's secondary is used, set flag to "secondary_used". However, if the opponent missed the previous turn the flag is unchanged.
		player.hooks.onAttack[instance] = (attack) => {
			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary'
			) {
				return
			}
			if (player.custom[status] === 'opponent_missed') return

			player.custom[status] = 'secondary_used'
		}

		//Create coin flip on opponent's turn if the flag is set to "secondary_used". If heads, set flag to "opponent_missed".
		otherPlayer.hooks.onAttack[instance] = (attack) => {
			if (player.custom[status] !== 'secondary_used') return

			const coinFlip = flipCoin(otherPlayer)
			otherPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				attack.multiplyDamage(0)
				attack.lockDamage()
				player.custom[status] = 'opponent_missed'
			}
		}

		//If the opponent missed last turn, clear the flag at the end of your turn.
		player.hooks.onTurnEnd[instance] = () => {
			if (player.custom[status] !== 'opponent_missed') return

			delete player.custom[status]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, otherPlayer} = pos
		const status = this.getInstanceKey(instance, 'status')
		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete otherPlayer.hooks.onAttack[instance]
		delete player.hooks.onTurnEnd[instance]
		delete player.custom[status]
	}
}

export default PearlescentMoonRareHermitCard
