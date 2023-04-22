import EffectCard from './_effect-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */
class DrMarioEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'dr_mario',
			name: 'Dr. Mario',
			rarity: 'common',
			description:
				'Stops RABIES.\n\nCan be used on active or AFK Characters. Discard after Use.\n\nCan also be attached to prevent RABIES.\n\nDiscard after user is knocked out.',
		})
		this.pickOn = 'apply'
		this.pickReqs = [{target: 'player', type: 'character', amount: 1}]
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
				const isRabid = row.ailments.some((a) => a.id === 'rabies')
				const hasBucket = row.effectCard?.cardId === this.id
				if (isRabid && hasBucket) {
					row.ailments = row.ailments.filter((a) => a.id !== 'rabies')
				}
			})
		})

		game.hooks.applyEffect.tap(this.id, (action, actionState) => {
			const {singleUseInfo} = game.ds
			const {pickedCardsInfo} = actionState
			if (singleUseInfo.id === this.id) {
				const suPickedCards = pickedCardsInfo[this.id] || []
				if (suPickedCards?.length !== 1) return 'INVALID'
				const {row} = suPickedCards[0]
				row.ailments = row.ailments.filter((a) => a.id !== 'rabies')
				return 'DONE'
			}
		})
	}
}

export default DrMarioEffectCard
