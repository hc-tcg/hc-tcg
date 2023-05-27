import SingleUseCard from './_single-use-card'
import {equalCard} from '../../../utils'
import {validPick} from '../../../utils/reqs'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

/*
Last lead version:
EP50 23:05
*/
class LeadSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'lead',
			name: 'Lead',
			rarity: 'common',
			description:
				"Move 1 of your opponents active Hermit's item cards to any of their AFK Hermits.\n\nReceiving Hermit must have open item card slot.\n\nDiscard after use.",
		})
		this.pickOn = 'apply'
		this.useReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'opponent', type: 'item', amount: 1, active: true},
			{target: 'opponent', type: 'item', amount: 1, empty: true, active: false},
		])
		this.pickReqs = this.useReqs
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, actionState) => {
			const {singleUseInfo, currentPlayer} = game.ds
			const {pickedCardsInfo} = actionState

			if (singleUseInfo?.id === this.id) {
				const suPickedCards = pickedCardsInfo[this.id] || []
				if (suPickedCards.length !== 2) return 'INVALID'

				const itemCardInfo = suPickedCards[0]
				const targetSlotInfo = suPickedCards[1]
				if (!validPick(game.state, this.pickReqs[0], itemCardInfo))
					return 'INVALID'
				if (targetSlotInfo.card !== null) return 'INVALID'
				if (!validPick(game.state, this.pickReqs[1], targetSlotInfo))
					return 'INVALID'

				// remove item from source
				itemCardInfo.row.itemCards[itemCardInfo.slotIndex] = null

				// add item to target
				targetSlotInfo.row.itemCards[targetSlotInfo.slotIndex] =
					itemCardInfo.card

				return 'DONE'
			}
		})
	}
}

export default LeadSingleUseCard
