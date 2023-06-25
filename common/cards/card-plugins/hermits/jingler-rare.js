import HermitCard from './_hermit-card'
import {discardCard, flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class JinglerRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'jingler_rare',
			name: 'Jingler',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 280,
			primary: {
				name: 'Jingled',
				cost: ['speedrunner'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Deception',
				cost: ['speedrunner', 'speedrunner', 'any'],
				damage: 80,
				power:
					'Flip a coin. If heads, opponent must discard a card from their hand.',
			},

			pickOn: 'followup',
			pickReqs: [
				{
					target: 'hand',
					type: ['hermit', 'effect', 'single_use', 'item'],
					amount: 1,
				},
			],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack[instance] = (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'secondary') return
			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] === 'tails') return

			opponentPlayer.followUp = this.id

			opponentPlayer.hooks.onFollowUp[instance] = (followUp, pickedSlots) => {
				if (followUp !== this.id) return
				const slots = pickedSlots[this.id]
				if (!slots || slots.length !== 1) return

				discardCard(game, slots[0].slot.card)

				opponentPlayer.followUp = null

				// We can't delete on onDetach because the hermit can die from
				// a backlash attack and the followUp will trigger after onDetach
				delete opponentPlayer.hooks.onFollowUp[instance]
				delete opponentPlayer.hooks.onFollowUpTimeout[instance]
			}

			opponentPlayer.hooks.onFollowUpTimeout[instance] = (followUp) => {
				if (followUp !== this.id) return

				// Discard the first card in the opponent's hand
				discardCard(game, opponentPlayer.hand[0])

				opponentPlayer.followUp = null

				delete opponentPlayer.hooks.onFollowUp[instance]
				delete opponentPlayer.hooks.onFollowUpTimeout[instance]
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
		delete player.hooks.afterAttack[instance]
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

export default JinglerRareHermitCard
