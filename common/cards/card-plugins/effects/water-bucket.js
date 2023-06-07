import EffectCard from './_effect-card'
import {validPick} from '../../../../server/utils/reqs'
import {GameModel} from '../../../../server/models/game-model'
import {discardCard} from '../../../../server/utils'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

class WaterBucketEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'water_bucket',
			name: 'Water Bucket',
			rarity: 'common',
			description:
				'Stops BURN.\n\nCan be used on active or AFK Hermits. Discard after Use.\n\nCan also be attached to prevent BURN.\n\nDiscard after user is knocked out.',
		})
		this.pickOn = 'apply'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'player', type: ['hermit'], amount: 1},
		])
	}

	//@TODO need to figure out pick process, etc - how to nicely define when a card needs to choose another?
	// and if we check if a card is correct programatically, then we no longer have auutomatic messages to show to to player
	// would have to have something like this:
	// pick info:

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {currentPlayer} = game.ds

		currentPlayer.hooks.turnEnd[instance] = (result) => {
			for (let i = 0; i < currentPlayer.board.rows.length; i++) {
				const row = currentPlayer.board.rows[i]
				if (row.effectCard?.cardInstance == instance) {
					const onFire = row.ailments.some((a) => {
						return a.id !== 'fire'
					})
					if (onFire) {
						row.ailments = row.ailments.filter((a) => {
							return a.id !== 'fire'
						})
						discardCard(game, {cardId: this.id, cardInstance: instance})
					}
				}
			}
		}
	}

	/**
	 * Called when an instance of this card is applied
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('common/types/pick-process').PickedCardsInfo} pickedCardsInfo
	 */
	onApply(game, instance, pickedCardsInfo) {
		const {singleUseInfo} = game.ds

		if (singleUseInfo?.id === this.id) {
			const suPickedCards = pickedCardsInfo[this.id] || []
			if (suPickedCards?.length !== 1) return 'INVALID'

			if (!validPick(game.state, this.pickReqs[0], suPickedCards[0]))
				return 'INVALID'

			const {row} = suPickedCards[0]
			row.ailments = row.ailments.filter((a) => a.id !== 'fire')
			return 'DONE'
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slot.type === 'single_use') return 'YES'

		if (pos.slot.type !== 'effect') return 'INVALID'
		if (pos.playerId !== currentPlayer.id) return 'INVALID'
		if (!pos.rowState?.hermitCard) return 'NO'

		return 'YES'
	}
}

export default WaterBucketEffectCard
