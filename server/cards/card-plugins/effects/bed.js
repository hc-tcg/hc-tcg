import EffectCard from './_effect-card'
import CARDS from '../../../cards'
import {discardCard} from '../../../utils'

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
	}
	register(game) {
		game.hooks.turnStart.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState
			// Need to know which row had bed at start of the turn
			const bedInfo = currentPlayer.custom[this.id] || {}
			currentPlayer.board.rows.forEach((row, rowIndex) => {
				const isSleeping = row.ailments.some((a) => a.id === 'sleeping')
				const hasBed = row.effectCard?.cardId === this.id
				if (!isSleeping && hasBed) {
					discardCard(game, row.effectCard)
				}
				if (hasBed) bedInfo[rowIndex] = true
			})
			if (Object.keys(bedInfo).length > 0) {
				currentPlayer.custom[this.id] = bedInfo
			}
		})

		game.hooks.turnEnd.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState
			const bedInfo = currentPlayer.custom[this.id] || {}
			currentPlayer.board.rows.forEach((row, index) => {
				const hadBed = bedInfo[index]
				const hasBed = row.effectCard?.cardId === this.id
				if (!hadBed && hasBed) {
					row.health = CARDS[row.hermitCard.cardId].health
					// clear any previous sleeping
					row.ailments = row.ailments.filter((a) => a.id !== 'sleeping')
					// set new sleeping for full two turns
					row.ailments.push({id: 'sleeping', duration: 2})
					bedInfo[index] = true
				}
			})
			delete currentPlayer.custom[this.id]
		})
	}
}

export default BedEffectCard
