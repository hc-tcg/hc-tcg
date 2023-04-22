import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class ShurikanSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'shurikan',
			name: 'Shurikan',
			rarity: 'common',
			description:
				'Does +40hp damage to any opposing AFK Character.\n\nDiscard after use.',
		})
		this.damage = {afkTarget: 40}
		this.pickOn = 'attack'
		this.useReqs = [
			{target: 'opponent', type: 'character', amount: 1, active: false},
		]
		this.pickReqs = this.useReqs
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {singleUseInfo} = game.ds
			const {pickedCardsInfo} = attackState
			if (singleUseInfo?.id !== this.id) return
			if (target.isActive) return

			// only attack selected afk target
			const bowPickedCards = pickedCardsInfo[this.id] || []
			if (bowPickedCards.length !== 1) return target
			const pickedCharacter = bowPickedCards[0]
			if (pickedCharacter.row !== target.row) return target

			target.extraEffectDamage += this.damage.afkTarget

			return target
		})
	}
}

export default ShurikanSingleUseCard
