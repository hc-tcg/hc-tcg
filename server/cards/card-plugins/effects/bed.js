import EffectCard from './_effect-card'
import CARDS from '../../../cards'
import {discardCard} from '../../../utils'

// TODO - test this doesn't introduce issues when sleeping hermit dies
// TODO - make this work with effect such as Emerald, Borrow, Curse-of-vanishing, etc.
// TODO - heal at the start not at the end of sleep
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

					row.ailments.push({id: 'sleeping', duration: 2})
					card.sleeping = this.turnDuration
				}
			})

		// Reduce counter every turn and set health to max once at 0
		game.hooks.turnStart.tap(this.id, (derivedState) => {
			const {currentPlayer, availableActions} = derivedState

			for (let row of currentPlayer.board.rows) {
				if (!row.effectCard) continue
				const sleeping = row.effectCard.sleeping
				if (sleeping && sleeping > 0) {
					row.effectCard.sleeping--
				} else if (sleeping === 0) {
					row.health = CARDS[row.hermitCard.cardId].health
					row.ailments = row.ailments.filter((a) => a.id != 'sleeping')
					delete row.effectCard.sleeping
					discardCard(game, row.effectCard)
				}
			}
		})

		// Disable attack actions while counter is >0
		game.hooks.availableActions.tap(
			this.id,
			(availableActions, derivedState) => {
				const {currentPlayer} = derivedState
				const anySleepers = currentPlayer.board.rows.some((row) => {
					return row.effectCard?.cardId === this.id && row.effectCard?.sleeping
				})

				const attackActions = [
					'ZERO_ATTACK',
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
				]
				return anySleepers
					? availableActions.filter((action) => !attackActions.includes(action))
					: availableActions
			}
		)
	}
}

export default BedEffectCard
