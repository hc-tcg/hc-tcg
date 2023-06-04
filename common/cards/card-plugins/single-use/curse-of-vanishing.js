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
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {PickedCardsInfo} pickedCards
	 * @returns {string}
	 */
	onApply(game, instance, pickedCards) {
		const {opponentPlayer, opponentActiveRow} = game.ds
		
		if (!isActive(opponentPlayer)) return 'INVALID'
		if (opponentActiveRow.effectCard && isRemovable(opponentActiveRow.effectCard)) {
			discardCard(game, activeRowState.effectCard)
		}
		return 'DONE'
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 * @returns {boolean}
	 */
	canAttach(game, pos) {
		if (!super.canAttach(game, pos)) return false
		const {opponentActiveRow} = game.ds

		if (!opponentActiveRow) return false
		if (!opponentActiveRow.effectCard || !isRemovable(opponentActiveRow.effectCard)) return false

		return true
	}
}

export default CurseOfVanishingSingleUseCard
