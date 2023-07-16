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
				power: 'Flip a coin. If heads, opponent must discard a card from their hand.',
			},

			pickOn: 'followup',
			pickReqs: [
				{
					target: 'opponent',
					slot: ['hand'],
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
		const followUpKey = this.getInstanceKey(instance)

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'secondary' || !attack.target) return
			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] === 'tails') return

			opponentPlayer.followUp[followUpKey] = this.id

			opponentPlayer.hooks.onFollowUp.add(instance, (followUp, pickedSlots) => {
				if (followUp !== followUpKey) return
				// We can't delete on onDetach because the hermit can die from
				// a backlash attack and the followUp will trigger after onDetach
				opponentPlayer.hooks.onFollowUp.remove(instance)
				opponentPlayer.hooks.onFollowUpTimeout.remove(instance)
				delete opponentPlayer.followUp[followUpKey]

				const slots = pickedSlots[this.id]
				if (!slots || slots.length !== 1) return

				discardCard(game, slots[0].slot.card)
			})

			opponentPlayer.hooks.onFollowUpTimeout.add(instance, (followUp) => {
				if (followUp !== followUpKey) return
				opponentPlayer.hooks.onFollowUp.remove(instance)
				opponentPlayer.hooks.onFollowUpTimeout.remove(instance)
				delete opponentPlayer.followUp[followUpKey]

				// Discard the first card in the opponent's hand
				discardCard(game, opponentPlayer.hand[0])
			})
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		player.hooks.afterAttack.remove(instance)
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
