import EffectCard from './_effect-card'
import {equalCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

/*
Latest version: EP50 - 24:26
I modified this to simplifi the process: Card is now random, but you don't have to flip a coin
*/
class LoyaltyEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'loyalty',
			name: 'Loyalty',
			rarity: 'rare',
			description:
				"When the Hermit that this card is attached to is knocked out, 1 of Hermit's attached item cards is randomly chosen to return to user's hand.\n\nDiscard after user is knocked out.",
		})
	}

	/**
	 * @param {GameModel} game
	 */
	returnItem(game) {
		const playerStates = Object.values(game.state.players)

		// We have to iterate over both players because current player can kill himself (e.g. TNT)
		for (let playerState of playerStates) {
			const playerRows = playerState.board.rows

			// We have to iterate over all rows because afk hermits can be attack (e.g. bow)
			for (let rowIndex in playerRows) {
				const row = playerRows[rowIndex]
				if (!row.hermitCard) continue
				const hasLoyalty = row.effectCard?.cardId === this.id
				const itemCards = row.itemCards.filter(Boolean)
				if (row.health <= 0 && hasLoyalty && itemCards.length) {
					const itemCard =
						itemCards[Math.floor(Math.random() * itemCards.length)]
					const index = row.itemCards.findIndex((card) =>
						equalCard(itemCard, card)
					)
					row.itemCards[index] = null
					playerState.hand.push(itemCard)
				}
			}
		}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		// death after attack
		game.hooks.actionEnd.tap(this.id, () => {
			this.returnItem(game)
		})

		// death due to ailments
		game.hooks.turnEnd.tap(this.id, () => {
			this.returnItem(game)
		})
	}
}

export default LoyaltyEffectCard
