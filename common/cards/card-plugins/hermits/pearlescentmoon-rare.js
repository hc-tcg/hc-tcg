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
		const {player, opponentPlayer} = pos
		const status = this.getInstanceKey(instance, 'status')
		const attackType = this.getInstanceKey(instance, 'attackType')
		const coinFlipResult = this.getInstanceKey(instance, 'coinFlipResult')

		//If pearl's secondary is used, set flag to "secondary_used". However, if the opponent missed the previous turn the flag is unchanged.
		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			player.custom[attackType] = attack.type
			if (attack.type !== 'secondary') return

			if (player.custom[status] === 'opponent_missed') return

			player.custom[status] = 'secondary_used'
		}

		opponentPlayer.hooks.beforeAttack[instance] = (attack) => {
			// We don't want to flip a coin for all the attacks on the same loop, 1 toss is enough
			if (
				player.custom[coinFlipResult] ||
				player.custom[status] !== 'secondary_used' ||
				!['primary', 'secondary'].includes(attack.type)
			)
				return
			const coinFlip = flipCoin(player, this.id, 1, opponentPlayer)
			player.custom[coinFlipResult] = coinFlip[0]
		}

		player.hooks.afterDefence[instance] = (attack) => {
			// The main loop is over, you can flip a coin again for the next loop
			delete player.custom[coinFlipResult]
		}

		// If the coin flip is heads and the opponent's attack is secondary, lock the damage to 0.
		opponentPlayer.hooks.onAttack[instance] = (attack) => {
			if (
				player.custom[status] !== 'secondary_used' ||
				!['primary', 'secondary'].includes(attack.type) ||
				player.custom[coinFlipResult] === 'heads'
			) {
				return
			}

			attack.multiplyDamage(0)
			attack.lockDamage()
		}

		opponentPlayer.hooks.onTurnEnd[instance] = () => {
			if (
				player.custom[coinFlipResult] &&
				player.custom[coinFlipResult] === 'heads'
			) {
				player.custom[status] = 'opponent_missed'
				delete player.custom[coinFlipResult]
			}
		}

		//If the opponent missed last turn, clear the flag at the end of your turn.
		player.hooks.onTurnEnd[instance] = () => {
			if (
				player.custom[attackType] !== 'secondary' ||
				player.custom[status] === 'opponent_missed'
			) {
				delete player.custom[status]
			}
			delete player.custom[attackType]
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
		const attackType = this.getInstanceKey(instance, 'attackType')
		const coinFlipResult = this.getInstanceKey(instance, 'coinFlipResult')
		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete opponentPlayer.hooks.onAttack[instance]
		delete opponentPlayer.hooks.beforeAttack[instance]
		delete player.hooks.afterDefence[instance]
		delete player.hooks.onTurnEnd[instance]
		delete opponentPlayer.hooks.onTurnEnd[instance]
		delete player.custom[status]
		delete player.custom[attackType]
		delete player.custom[coinFlipResult]
	}
}

export default PearlescentMoonRareHermitCard
