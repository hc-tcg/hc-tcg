import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

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
		const {player, opponentPlayer} = pos
		// secondary_used, opponent_miss, opponent_hit
		const status = this.getInstanceKey(instance, 'status')

		// If pearl's secondary is used, set flag to "secondary_used". However, if the opponent missed the previous turn the flag is unchanged.
		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'secondary') return

			// If opponent missed last turn, don't allow ability to activate
			if (player.custom[status] === 'opponent_miss') return

			player.custom[status] = 'secondary_used'
		}

		// If the opponent missed last turn, clear the flag at the end of our turn.
		player.hooks.onTurnEnd[instance] = () => {
			if (player.custom[status] === 'opponent_miss') {
				delete player.custom[status]
			}
		}

		opponentPlayer.hooks.beforeAttack[instance] = (attack) => {
			// Flip a coin once at the start of their attack loop
			if (player.custom[status] !== 'secondary_used') return

			const coinFlip = flipCoin(player, this.id, 1, opponentPlayer)
			if (coinFlip[0] === 'heads') {
				player.custom[status] = 'opponent_miss'
			} else {
				player.custom[status] = 'opponent_hit'
			}
		}

		// If the coin flip is heads and it's the opponent hermit attack, lock the damage to 0.
		opponentPlayer.hooks.onAttack[instance] = (attack) => {
			if (
				player.custom[status] === 'opponent_miss' &&
				!attack.isType('effect', 'ailment') &&
				!attack.isBacklash
			) {
				attack.multiplyDamage(this.id, 0).lockDamage()
			}
		}

		opponentPlayer.hooks.onTurnEnd[instance] = () => {
			// Their turn is over, delete the status unless it's opponent missed
			if (player.custom[status] !== 'opponent_miss') {
				delete player.custom[status]
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		const status = this.getInstanceKey(instance, 'status')

		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete player.hooks.onTurnEnd[instance]

		delete opponentPlayer.hooks.beforeAttack[instance]
		delete opponentPlayer.hooks.onAttack[instance]
		delete opponentPlayer.hooks.onTurnEnd[instance]

		delete player.custom[status]
	}
}

export default PearlescentMoonRareHermitCard
