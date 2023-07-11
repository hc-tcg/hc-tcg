import {GameModel} from '../../../../server/models/game-model'
import EffectCard from './_effect-card'

class MilkBucketEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'milk_bucket',
			name: 'Milk Bucket',
			rarity: 'common',
			description:
				'Remove poison and bad omen on active or AFK Hermit.\n\nOR can be attached to prevent poison.',
			pickOn: 'apply',
			pickReqs: [{target: 'player', slot: ['hermit'], amount: 1}],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer, slot, row} = pos
		if (slot.type === 'single_use') {
			player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
				const pickedCards = pickedSlots[this.id] || []
				if (pickedCards.length !== 1) return
				const targetSlot = pickedCards[0]
				if (!targetSlot.row || !targetSlot.row.state.hermitCard) return

				targetSlot.row.state.ailments = targetSlot.row.state.ailments.filter(
					(a) => a.id !== 'poison' && a.id !== 'badomen'
				)
			}
		} else if (slot.type === 'effect') {
			player.hooks.onDefence[instance] = (attack, pickedSlots) => {
				if (!row) return
				row.ailments = row.ailments.filter((a) => a.id !== 'poison')
			}

			opponentPlayer.hooks.afterApply[instance] = (attack, pickedSlots) => {
				if (!row) return
				row.ailments = row.ailments.filter((a) => a.id !== 'poison')
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		delete player.hooks.onApply[instance]
		delete player.hooks.onDefence[instance]
		delete opponentPlayer.hooks.afterApply[instance]
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		if (!['single_use', 'effect'].includes(pos.slot.type)) return 'INVALID'
		if (!pos.row?.hermitCard && pos.slot.type === 'effect') return 'NO'

		return 'YES'
	}
}

export default MilkBucketEffectCard
