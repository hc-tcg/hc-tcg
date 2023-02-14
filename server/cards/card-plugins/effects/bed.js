import EffectCard from './_effect-card'
import CARDS from '../../../cards'
import {discardCard} from '../../../utils'

// TODO - test this doesn't introduce issues when sleeping hermit dies
// TODO - make this work with effect such as Emerald, Borrow, Curse-of-vanishing, etc.
class BedEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'bed',
			name: 'Bed',
			rarity: 'ultra_rare',
			description:
				"Player sleeps for the next 2 turns. Can't attack. Restores full health.\n\nCan still draw and attach cards while sleeping.\n\nDiscard after player wakes up.",
		})
		// -1 for current turn
		this.turnDuration = 1
	}
	register(game) {
		// Start counter when effect card is attached
		game.hooks.playCard
			.for('effect')
			.tap(this.id, (turnAction, derivedState) => {
				const {currentPlayer} = derivedState
				const {card, rowIndex} = turnAction.payload
				if (card?.cardId === this.id) {
					const row = currentPlayer.board.rows[rowIndex]

					// e.g. if bdubs used his atttack
					if (row.ailments.find(a => a.id == "sleeping")) return

					// instantly heal to max hp
					row.health = CARDS[row.hermitCard.cardId].health

					row.ailments.push({id: 'sleeping', duration: 2})
				}
			})
	}
}

export default BedEffectCard
