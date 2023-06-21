import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/pick-process').PickedSlots} PickedSlots
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class BadOmenSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'bad_omen',
			name: 'Bad Omen',
			rarity: 'rare',
			description: `Give the opposing active hermit bad omen for the next 3 turns.\n\nWhile they have this effect, all of their coin flips are tails..`,
		})
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 * @param {PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const {opponentPlayer} = pos
		const activeRow = opponentPlayer.board.activeRow
		if (activeRow === null) return

		opponentPlayer.board.rows[activeRow].ailments.push({
			id: 'badomen',
			duration: 3,
		})
	}

	getExpansion() {
		return 'alter_egos'
	}
}

export default BadOmenSingleUseCard
