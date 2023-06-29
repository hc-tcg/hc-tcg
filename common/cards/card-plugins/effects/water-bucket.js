import {GameModel} from '../../../../server/models/game-model'
import {discardCard} from '../../../../server/utils'
import EffectCard from './_effect-card'

class WaterBucketEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'water_bucket',
			name: 'Water Bucket',
			rarity: 'common',
			description:
				'Remove burn and String on active or AFK Hermit.\n\nOR can be attached to prevent burn.',
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
				targetSlot.row.state.ailments = targetSlot.row.state.ailments.filter((a) => a.id !== 'fire')

				if (targetSlot.row.state.effectCard?.cardId === 'string') {
					discardCard(game, targetSlot.row.state.effectCard)
				}
				for (let i = 0; i < targetSlot.row.state.itemCards.length; i++) {
					if (targetSlot.row.state.itemCards[i]?.cardId === 'string') {
						discardCard(game, targetSlot.row.state.itemCards[i])
					}
				}
			}
		} else if (slot.type === 'effect') {
			player.hooks.onDefence[instance] = (attack) => {
				if (!row) return
				row.ailments = row.ailments.filter((a) => a.id !== 'fire')
			}

			opponentPlayer.hooks.afterApply[instance] = (pickedSlots, modalResult) => {
				if (!row) return
				row.ailments = row.ailments.filter((a) => a.id !== 'fire')
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
		delete opponentPlayer.hooks.afterApply[instance]
		delete player.hooks.onDefence[instance]
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

export default WaterBucketEffectCard
