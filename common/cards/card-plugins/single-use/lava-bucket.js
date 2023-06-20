import SingleUseCard from './_single-use-card'
import {discardCard} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class LavaBucketSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'lava_bucket',
			name: 'Lava Bucket',
			rarity: 'rare',
			description:
				'Burn opposing active Hermit. Add 20hp damage every turn at the end of your turn.',
		})
	}

	canApply() {
		return true
	}

	/**
	 * Called when an instance of this card is applied
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 * @param {import('../../../types/pick-process').PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const opponentActiveRow = pos.opponentPlayer.board.activeRow
		if (opponentActiveRow === null) return

		const hasDamageEffect = pos.opponentPlayer.board.rows[
			opponentActiveRow
		].ailments.some((ailment) => {
			return ailment.id === 'fire' || ailment.id === 'poison'
		})
		if (!hasDamageEffect) {
			pos.opponentPlayer.board.rows[opponentActiveRow].ailments.push({
				id: 'fire',
				duration: -1,
			})
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		if (pos.slot.type !== 'single_use') return 'INVALID'

		if (pos.opponentPlayer.board.activeRow === null) return 'NO'

		return 'YES'
	}
}

export default LavaBucketSingleUseCard
