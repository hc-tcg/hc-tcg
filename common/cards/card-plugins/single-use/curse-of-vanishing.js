import SingleUseCard from './_single-use-card'
import {discardCard, isActive, isRemovable} from '../../../../server/utils'

/**
 * @typedef {import('server/models/game-model').GameModel} GameModel
 * @typedef {import('common/types/pick-process').PickedSlotsInfo} PickedSlotsInfo
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
	 * @param {PickedSlotsInfo} pickedSlots
	 */
	onApply(game, instance, pickedSlots) {
		const {opponentActiveRow} = game.ds
		
		if (!opponentActiveRow) return
		if (opponentActiveRow.effectCard && isRemovable(opponentActiveRow.effectCard)) {
			discardCard(game, opponentActiveRow.effectCard)
		}
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'NO') return 'INVALID'
		const {opponentActiveRow} = game.ds

		if (!opponentActiveRow) return 'INVALID'
		if (!opponentActiveRow.effectCard || !isRemovable(opponentActiveRow.effectCard)) return 'INVALID'

		return 'YES'
	}
}

export default CurseOfVanishingSingleUseCard
