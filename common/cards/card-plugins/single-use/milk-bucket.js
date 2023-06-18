import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('../../../types/pick-process').PickRequirmentT} PickRequirmentT
 */
class MilkBucketSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'milk_bucket',
			name: 'Milk Bucket',
			rarity: 'common',
			description:
				'Remove posion or bad omen on active or AFK Hermit.\nOR can be attached to prevent poison.',
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
			const milkHook = () => {
				if (!pos.row) return
				pos.row.ailments = pos.row.ailments.filter((a) => {
					return a.id !== 'poison'
				})
			}
			pos.otherPlayer.hooks.onApply[instance] = milkHook
			pos.otherPlayer.hooks.afterAttack[instance] = milkHook
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
			(a) => a.id !== 'poison' && a.id !== 'badomen'
		)
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

export default MilkBucketSingleUseCard
