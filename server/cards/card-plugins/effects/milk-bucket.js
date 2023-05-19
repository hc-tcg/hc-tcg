import EffectCard from './_effect-card'
import {validPick} from '../../../utils/reqs'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */
class MilkBucketEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'milk_bucket',
			name: 'Milk Bucket',
			rarity: 'common',
			description:
				'Stops POISON.\n\nCan be used on active or AFK Hermits. Discard after Use.\n\nCan also be attached to prevent POISON.\n\nDiscard after user is knocked out.',
		})
		this.pickOn = 'apply'
		this.pickReqs = /** @satisfies {Array<PickRequirmentT>} */ ([
			{target: 'player', type: 'hermit', amount: 1, empty: false},
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
				const isPoisoned = row.ailments.some((a) => a.id === 'poison')
				const hasBucket = row.effectCard?.cardId === this.id
				if (isPoisoned && hasBucket) {
					row.ailments = row.ailments.filter((a) => a.id !== 'poison')
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
				row.ailments = row.ailments.filter((a) => a.id !== 'poison')
				return 'DONE'
			}
		})
	}
}

export default MilkBucketEffectCard
