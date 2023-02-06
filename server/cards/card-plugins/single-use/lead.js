import SingleUseCard from './_single-use-card'
import {equalCard} from '../../../utils'

/*
Last lead version:
EP50 23:05
*/
// TODO - limit this to only opponent side
class LeadSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'lead',
			name: 'Lead',
			rarity: 'common',
			description:
				"Move 1 of your opponents active Hermit's item cards to any of their AFK Hermits.\n\nReceiving Hermit must have open item card slot.\n\nDiscard after use.",
		})
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, currentPlayer, pickedCardsInfo} = derivedState

			if (singleUseInfo?.id === this.id) {
				const suPickedCards = pickedCardsInfo[this.id] || []
				if (suPickedCards.length !== 2) return 'INVALID'

				const itemCardInfo = suPickedCards[0]
				const targetSlotInfo = suPickedCards[1]
				if (itemCardInfo.cardInfo.type !== 'item') return 'INVALID'
				if (targetSlotInfo.card !== null) return 'INVALID'
				if (targetSlotInfo.row.hermitCard === null) return 'INVALID'

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
