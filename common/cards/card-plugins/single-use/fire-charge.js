import {discardCard, discardSingleUse, rowHasItem, isRemovable} from '../../../../server/utils'
import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import CARDS from '../../../cards'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class FireChargeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'fire_charge',
			name: 'Fire Charge',
			rarity: 'common',
			description:
				'Discard 1 attached item or effect card from your active or AFK Hermit.\n\nYou can use another single use effect card this turn.',

			pickOn: 'apply',
			pickReqs: [{target: 'player', type: ['item', 'effect'], amount: 1}],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 * @returns {"YES" | "NO" | "INVALID"}
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {player} = pos

		for (const row of player.board.rows) {
			const cards = row.itemCards
			let total = 0
			// Should be able to remove string on the item slots
			const validTypes = new Set(['effect', 'item'])

			for (const card of cards) {
				if (card && validTypes.has(CARDS[card.cardId]?.type)) {
					total++
				}
			}

			if ((row.effectCard !== null && isRemovable(row.effectCard)) || total > 0) return 'YES'
		}

		return 'NO'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.beforeApply[instance] = (pickedSlots, modalResult) => {
			const slots = pickedSlots[this.id] || []
			if (slots.length !== 1) return

			const pickedCard = slots[0]
			if (pickedCard.slot.card === null) return

			discardCard(game, pickedCard.slot.card)

			// We remove on turnEnd instead of onDetach because we need to keep the hooks
			// until the end of the turn in case the player plays another single use card
			player.hooks.onTurnEnd[instance] = () => {
				delete player.hooks.onTurnEnd[instance]
				delete player.hooks.availableActions[instance]
				delete player.hooks.onApply[instance]
			}

			player.hooks.availableActions[instance] = (availableActions) => {
				// We have to check if PLAY_SINGLE_USE_CARD is already there because it's possible that another card added it
				// e.g. if you play a card that allows you to play another single use card like multiple Pistons back to back
				if (!availableActions.includes('PLAY_SINGLE_USE_CARD')) {
					availableActions.push('PLAY_SINGLE_USE_CARD')
				}

				return availableActions
			}

			player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
				if (player.board.singleUseCard?.cardInstance === instance) return
				delete player.hooks.availableActions[instance]
			}
		}

		player.hooks.afterApply[instance] = (pickedSlots, modalResult) => {
			discardSingleUse(game, player)
		}
	}

	onDetach(game, instance, pos) {
		const {player} = pos

		delete player.hooks.afterApply[instance]
		delete player.hooks.beforeApply[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default FireChargeSingleUseCard
