import EffectCard from './_effect-card'
import {validPick} from '../../../utils/reqs'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
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
			{target: 'player', type: 'hermit', amount: 1},
		])

		this.attachReq = {target: 'player', type: ['effect', 'single_use']}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.actionEnd.tap(this.id, () => {
			const {currentPlayer, opponentPlayer} = game.ds
			const allRows = [
				...currentPlayer.board.rows,
				...opponentPlayer.board.rows,
			]
			allRows.forEach((row) => {
				const onFire = row.ailments.some((a) => a.id === 'fire')
				const hasBucket = row.effectCard?.cardId === this.id
				if (onFire && hasBucket) {
					row.ailments = row.ailments.filter((a) => a.id !== 'fire')
				}
			})
		})

		game.hooks.applyEffect.tap(this.id, (action, actionState) => {
			const {singleUseInfo} = game.ds
			const {pickedCardsInfo} = actionState
			if (singleUseInfo?.id === this.id) {
				const suPickedCards = pickedCardsInfo[this.id] || []
				if (suPickedCards?.length !== 1) return 'INVALID'

				if (!validPick(game.state, this.pickReqs[0], suPickedCards[0]))
					return 'INVALID'

				const {row} = suPickedCards[0]
				row.ailments = row.ailments.filter((a) => a.id !== 'fire')
				return 'DONE'
			}
		})
	}
}

export default WaterBucketEffectCard
