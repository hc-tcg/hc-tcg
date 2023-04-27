import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class NukeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: '',
			name: 'Crossbow',
			rarity: 'rare',
			description:
				"Does +40hp damage to all of opposing characters active and benched; take 40 damage recoil\n\nDiscard after use.",
		})
		this.damage = {target: 30, afkTarget: 30}

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

			target.extraEffectDamage += this.damage.afkTarget
			return target
		})
	}
}

export default NukeSingleUseCard
