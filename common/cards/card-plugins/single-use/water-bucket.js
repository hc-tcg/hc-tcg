import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {discardCard} from '../../../../server/utils'

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
				'Remove burn or String on active or AFK Hermit.\nOR can be attached to prevent burn.',
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
			const waterHook = () => {
				if (!pos.row) return
				pos.row.ailments = pos.row.ailments.filter((a) => {
					return a.id !== 'fire'
				})
			}
			pos.otherPlayer.hooks.onApply[instance] = waterHook
			pos.otherPlayer.hooks.afterAttack[instance] = waterHook
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		if (pos.otherPlayer.hooks.onApply[instance]) {
			//If this is attached as an effect
			delete pos.otherPlayer.hooks.onApply[instance]
			delete pos.otherPlayer.hooks.afterAttack[instance]
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
		if (targetSlot.row.state.effectCard?.cardId === 'string') {
			discardCard(game, targetSlot.row.state.effectCard)
		}
		for (let i = 0; i < targetSlot.row.state.itemCards.length; i++) {
			if (targetSlot.row.state.itemCards[i]?.cardId === 'string') {
				discardCard(game, targetSlot.row.state.itemCards[i])
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		if (pos.slot.type === 'single_use') return 'YES'

		if (pos.slot.type !== 'effect') return 'INVALID'
		if (!pos.row?.hermitCard) return 'NO'

		return 'YES'
	}
}

export default WaterBucketSingleUseCard
