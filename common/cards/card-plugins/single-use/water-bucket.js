import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

class WaterBucketSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'water_bucket',
			name: 'Water Bucket',
			rarity: 'common',
			description:
				'Stops BURN.\n\nCan be used on active or AFK Hermits. Discard after Use.\n\nCan also be attached to prevent BURN.\n\nDiscard after user is knocked out.',
			pickOn: 'apply',
			pickReqs: [{target: 'player', type: ['hermit'], amount: 1}],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		if (pos.rowIndex) {
			pos.otherPlayer.hooks.onApply[instance] = (instance) => {
				if (!pos.row) return
				const onFire = pos.row.ailments.some((a) => {
					return a.id === 'fire'
				})
				if (onFire) {
					pos.row.ailments = pos.row.ailments.filter((a) => {
						return a.id !== 'fire'
					})
				}
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		if (pos.otherPlayer.hooks.onApply[instance]) {
			delete pos.otherPlayer.hooks.onApply[instance]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 * @param {import('../../../types/pick-process').PickedSlots} pickedSlots
	 */
	onApply(game, instance, pos, pickedSlots) {
		const pickedCards = pickedSlots[this.id] || []
		if (pickedCards.length !== 1) return
		const targetSlot = pickedCards[0]
		if (!targetSlot.row || !targetSlot.row.state.hermitCard) return

		targetSlot.row.state.ailments = targetSlot.row.state.ailments.filter(
			(a) => a.id !== 'fire'
		)
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		if (pos.slot.type === 'single_use') return 'YES'

		if (pos.slot.type !== 'effect') return 'INVALID'
		if (pos.playerId !== pos.player.id) return 'INVALID'
		if (!pos.row?.hermitCard) return 'NO'

		return 'YES'
	}
}

export default WaterBucketSingleUseCard
