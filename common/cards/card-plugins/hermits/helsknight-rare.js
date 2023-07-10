import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'
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
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			opponentPlayer.hooks.onApply[instance] = () => {
				if (!opponentPlayer.board.singleUseCard) return
				const coinFlip = flipCoin(player, this.id, 1, opponentPlayer)

				if (coinFlip[0] == 'heads') {
					moveCardToHand(game, opponentPlayer.board.singleUseCard, true)
					opponentPlayer.board.singleUseCardUsed = false
				}
			}

			opponentPlayer.hooks.onTurnEnd[instance] = () => {
				delete opponentPlayer.hooks.onApply[instance]
				delete opponentPlayer.hooks.onTurnEnd[instance]
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onAttack[instance]
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
