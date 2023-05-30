import SingleUseCard from './_single-use-card'
import {discardCard, isActive, isRemovable} from '../../../../server/utils'

/**
 * @typedef {import('server/models/game-model').GameModel} GameModel
 */

class CurseOfVanishingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'curse_of_vanishing',
			name: 'Curse Of Vanishing',
			rarity: 'common',
			description:
				"Your opponent is forced to discard their active Hermit's attached effect card.",
		})

		this.useReqs = [
			{target: 'opponent', type: 'effect', amount: 1, active: true},
		]
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {PickedCardsInfo} pickedCards
	 * @returns {string}
	 */
	onApply(game, instance, pickedCards) {
		const {opponentPlayer} = game.ds
		
		if (!isActive(opponentPlayer)) return 'INVALID'
		if (activeRowState.effectCard && isRemovable(activeRowState.effectCard)) {
			discardCard(game, activeRowState.effectCard)
		}
		return 'DONE'
	}
}

export default CurseOfVanishingSingleUseCard
