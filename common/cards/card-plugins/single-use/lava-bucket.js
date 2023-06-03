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
	 * @param {import('./_single-use-card').PickedCardsInfo} pickedCards
	 */
	onApply(game, instance, pickedCards) {
		const {singleUseInfo, opponentActiveRow} = game.ds
		if (singleUseInfo?.id === this.id) {
			if (opponentActiveRow === null) return 'INVALID'
			const hasWaterBucket =
				opponentActiveRow.effectCard?.cardId === 'water_bucket'
			const hasDamageEffect = opponentActiveRow.ailments.some((a) =>
				['fire', 'poison'].includes(a.id)
			)
			if (!hasWaterBucket && !hasDamageEffect) {
				opponentActiveRow.ailments.push({id: 'fire', duration: -1})
			}
			return 'DONE'
		}
	}
}

export default LavaBucketSingleUseCard
