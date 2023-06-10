import HermitCard from './_hermit-card'
import {flipCoin, discardSingleUse} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

// Because of this card we can't rely elsewhere on the suCard to be in state on turnEnd hook
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
					'If opponent uses a single use effect card on their next turn, they must flip acoin. If heads, you take the card after its effect is applied and add it to your hand.',
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
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'secondary') return

			player.custom[this.id] = true
		}

		otherPlayer.hooks.afterAttack[instance] = () => {
			if (
				player.custom[this.id] == true &&
				otherPlayer.board.singleUseCardUsed &&
				otherPlayer.board.singleUseCard
			) {
				const coinFlip = flipCoin(otherPlayer)
				otherPlayer.coinFlips[this.id] = coinFlip

				if (coinFlip[0] == 'heads')
					player.hand.push(otherPlayer.board.singleUseCard)
			}

			player.custom[this.id] = false
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, otherPlayer} = pos
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
