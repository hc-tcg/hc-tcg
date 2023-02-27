import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class CrossbowSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'crossbow',
			name: 'Crossbow',
			rarity: 'rare',
			description:
				"Does +40hp damage to opposing Hermit and +10hp damage to AFK Hermit of player's choice.\n\nDiscard after use.",
		})
		this.damage = {target: 40, afkTarget: 10}

		this.pickOn = 'attack'
		this.useReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: true},
		]
		this.pickReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: false},
		]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {singleUseInfo} = game.ds
			const {pickedCardsInfo} = attackState
			if (singleUseInfo?.id !== this.id) return target
			if (target.isActive) {
				target.extraEffectDamage += this.damage.target
				return target
			}

			// only attack selected afk target
			const crossbowPickedCards = pickedCardsInfo[this.id] || []
			if (crossbowPickedCards.length !== 1) return target
			const pickedHermit = crossbowPickedCards[0]
			if (pickedHermit.row !== target.row) return target

			target.extraEffectDamage += this.damage.afkTarget
			return target
		})
	}
}

export default CrossbowSingleUseCard
