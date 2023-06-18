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
		const {player, otherPlayer} = pos

		player.hooks.afterAttack[instance] = (attackResult) => {
			if (attackResult.attack.id !== this.getInstanceKey(instance)) return
			const coinFlip = flipCoin(player, this.id)
			player.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'tails') return

			otherPlayer.followUp = this.id

			otherPlayer.hooks.onFollowUp[instance] = (followUp, pickedSlots) => {
				if (followUp !== this.id) return
				const slots = pickedSlots[this.id]
				if (!slots || slots.length !== 1) return

				discardCard(game, slots[0].slot.card)

				otherPlayer.followUp = null

				// We can't delete on onDetach because the hermit can die from
				// a backlash attack and the followUp will trigger after onDetach
				delete otherPlayer.hooks.onFollowUp[instance]
				delete otherPlayer.hooks.onFollowUpTimeout[instance]
			}

			otherPlayer.hooks.onFollowUpTimeout[instance] = (followUp) => {
				if (followUp !== this.id) return

				// Discard the first card in the opponent's hand
				discardCard(game, otherPlayer.hand[0])

				otherPlayer.followUp = null

				delete otherPlayer.hooks.onFollowUp[instance]
				delete otherPlayer.hooks.onFollowUpTimeout[instance]
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
