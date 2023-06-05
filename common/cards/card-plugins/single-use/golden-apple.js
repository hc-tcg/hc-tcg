import SingleUseCard from './_single-use-card'
import {validPick} from '../../../../server/utils/reqs'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

class GoldenAppleSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'golden_apple',
			name: 'Golden Apple',
			rarity: 'ultra_rare',
			description:
				'Heals +100hp.\n\nCan be used on active or AFK Hermits.\n\nDiscard after use.',
		})
		this.heal = 100
		this.pickOn = 'apply'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'player', type: 'hermit', amount: 1},
		])
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, actionState) => {
			const {singleUseInfo} = game.ds
			const {pickedSlotsInfo} = actionState
			if (singleUseInfo?.id === this.id) {
				const suPickedCards = pickedSlotsInfo[this.id] || []
				if (suPickedCards?.length !== 1) return 'INVALID'
				if (!validPick(game.state, this.pickReqs[0], suPickedCards[0]))
					return 'INVALID'
				const {row, cardInfo} = suPickedCards[0]
				if (row.health === null) return 'INVALID'
				row.health = Math.min(
					row.health + this.heal,
					cardInfo.health // max health
				)

				return 'DONE'
			}
		})
	}
}

export default GoldenAppleSingleUseCard
