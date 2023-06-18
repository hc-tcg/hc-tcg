import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {moveCardToHand} from '../../../../server/utils'

class HelsknightRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'helsknight_rare',
			name: 'Helsknight',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 270,
			primary: {
				name: 'Pitfall',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Trap Hole',
				cost: ['pvp', 'pvp', 'pvp'],
				damage: 100,
				power:
					'If opponent uses a single use effect card on their next turn, they must flip a coin. If heads, you take the card after its effect is applied and add it to your hand.',
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

		player.hooks.onAttack[instance] = (attack) => {
			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary'
			)
				return

			player.custom[instance] = true
		}

		otherPlayer.hooks.onAttack[instance] = () => {
			if (!player.custom[instance]) return
			otherPlayer.hooks.afterAttack[instance] = (attackResult) => {
				if (attackResult.attack.type === 'effect') {
					if (!otherPlayer.board.singleUseCard) return
					const coinFlip = flipCoin(otherPlayer, this.id, 1)
					otherPlayer.coinFlips[this.id] = coinFlip

					if (coinFlip[0] == 'heads') {
						moveCardToHand(game, otherPlayer.board.singleUseCard)
						player.board.singleUseCardUsed = false
					}
				}

				delete otherPlayer.hooks.afterAttack[instance]
			}
		}

		otherPlayer.hooks.onTurnEnd[instance] = () => {
			delete player.custom[instance]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, otherPlayer} = pos
		delete player.hooks.onAttack[instance]
		delete otherPlayer.hooks.onAttack[instance]
		delete otherPlayer.hooks.onTurnEnd[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}

	getPalette() {
		return 'alter_egos'
	}

	getBackground() {
		return 'alter_egos_background'
	}
}

export default HelsknightRareHermitCard
