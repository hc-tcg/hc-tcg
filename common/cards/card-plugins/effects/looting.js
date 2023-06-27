import EffectCard from './_effect-card'
import {discardCard, getActiveRow, rowHasItem} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class LootingEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'looting',
			name: 'Looting',
			rarity: 'rare',
			description:
				"When your opponent's Hermit is knocked out by your active Hermit that this card is attached to, pick 2 attached item cards from the opposing active Hermit and add them to your hand.",
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
			// This needs to happen after Loyalty
			opponentPlayer.hooks.onHermitDeath[instance] = (hermitPos) => {
				// Don't activate if the row has no item cards
				if (!hermitPos.row || !rowHasItem(hermitPos.row)) return

				// Client uses the id instead of the instance for the modal
				player.custom[this.id] = {
					cards: [...hermitPos.row.itemCards.filter(Boolean)],
				}

				player.followUp = this.id

				// Only choose from one row if multiple hermits are knocked out at once
				// we could allow to pick from multiple rows but the UI would be confusing
				delete opponentPlayer.hooks.onHermitDeath[instance]
			}
		}

		player.hooks.onFollowUp[instance] = (followUp, pickedSlots, modalResult) => {
			if (followUp !== this.id) return
			player.followUp = null

			if (!modalResult || !modalResult.cards) return
			if (modalResult.cards.length === 0) return
			if (modalResult.cards.length > 2) return

			const activeRow = getActiveRow(player)
			if (activeRow === null) return
			// Discard looting, can't do it on afterAttack because it would delete this hook
			discardCard(game, activeRow?.effectCard)

			for (const card of modalResult.cards) {
				player.hand.push(card)
				// Remove the card from the other player's discarded pile
				opponentPlayer.discarded.splice(opponentPlayer.discarded.indexOf(card), 1)
			}
		}

		player.hooks.onFollowUpTimeout[instance] = (followUp) => {
			if (followUp !== this.id) return
			player.followUp = null

			// If the player didn't pick any cards, pick 1 or 2 random cards
			const cards = player.custom[this.id].cards
			let totalPicked = 0
			for (const card of cards) {
				if (totalPicked === 2) break
				player.hand.push(card)
				opponentPlayer.discarded.splice(opponentPlayer.discarded.indexOf(card), 1)
				totalPicked++
			}

			const activeRow = getActiveRow(player)
			if (activeRow === null) return
			// Discard looting, can't do it on afterAttack because it would delete this hook
			discardCard(game, activeRow?.effectCard)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		delete player.hooks.afterAttack[instance]
		delete player.hooks.onFollowUp[instance]
		delete player.hooks.onFollowUpTimeout[instance]
		delete opponentPlayer.hooks.onHermitDeath[instance]
		delete player.custom[this.id]
	}
}

export default LootingEffectCard
