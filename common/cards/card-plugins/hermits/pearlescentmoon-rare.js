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
		const coinFlipResult = this.getInstanceKey(instance, 'coinFlipResult')
		const status = this.getInstanceKey(instance, 'status')
		player.custom[status] = 'normal'

		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (player.custom[status] === 'missed') {
				player.custom[status] = 'normal'
				return
			}
			if (attack.type !== 'secondary') return

			opponentPlayer.hooks.beforeAttack[instance] = (attack) => {
				if (['ailment', 'backlash'].includes(attack.type)) return

				// No need to flip a coin for multiple attacks
				if (!player.custom[coinFlipResult]) {
					const coinFlip = flipCoin(player, this.id, 1, opponentPlayer)
					if (coinFlip[0] === 'tails') return
					player.custom[coinFlipResult] = coinFlip[0]
					player.custom[status] = 'missed'
				}

				if (player.custom[coinFlipResult] === 'heads') {
					attack.multiplyDamage(0)
					attack.lockDamage()
				}
			}

			opponentPlayer.hooks.onTurnEnd[instance] = () => {
				const isPearlDead = pos.row?.hermitCard?.cardInstance !== instance
				const isActive = opponentPlayer.board.activeRow === pos.rowIndex

				if (isPearlDead || !isActive) {
					player.custom[status] = 'normal'
				}
				delete opponentPlayer.hooks.beforeAttack[instance]
				delete opponentPlayer.hooks.onTurnEnd[instance]
				delete player.custom[coinFlipResult]
			}
		}

		// If the opponent missed the previous turn and we switch hermits or we don't
		// attack this turn then we reset the status
		player.hooks.onTurnEnd[instance] = () => {
			if (player.custom[status] === 'missed') {
				player.custom[status] = 'normal'
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
		delete player.hooks.onAttack[instance]
		delete player.hooks.onTurnEnd[instance]
		delete player.custom[this.getInstanceKey(instance, 'status')]
	}
}

export default PearlescentMoonRareHermitCard
