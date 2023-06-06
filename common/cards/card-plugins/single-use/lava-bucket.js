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
				'BURNS the opposing Hermit\n\nDoes an additional +20hp damage per turn until opponent is knocked out.\n\nGoing AFK does not eliminate the BURN. Discard after use.',
		})
	}

	/**
	 * Called when an instance of this card is applied
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 * @param {import('../../../types/pick-process').PickedSlotsInfo} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const opponentActiveRow = pos.otherPlayer.board.activeRow
		if (opponentActiveRow === null) return 'INVALID'

		const hasDamageEffect = pos.otherPlayer.board.rows[
			opponentActiveRow
		].ailments.some((ailment) => {
			return ailment.id === 'fire' || ailment.id === 'poison'
		})
		if (!hasDamageEffect) {
			pos.otherPlayer.board.rows[opponentActiveRow].ailments.push({
				id: 'fire',
				duration: -1,
			})
		}
		return 'DONE'
	}
}

export default LavaBucketSingleUseCard
