import SingleUseCard from './_single-use-card'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class TNTSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'tnt',
			name: 'TNT',
			rarity: 'common',
			description:
				'Does +60hp damage to opposing Hermit.\n\nAlso does +20hp damage to user.\n\nDiscard after use.',
		})
		this.damage = {target: 60, self: 20}

		this.useReqs = [
			{target: 'opponent', type: 'hermit', amount: 1, active: true},
		]
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target) => {
			const {singleUseInfo} = game.ds
			if (singleUseInfo?.id === this.id && target.isActive) {
				target.extraEffectDamage += this.damage.target
				target.backlash += this.damage.self
			}
			return target
		})
	}
}

export default TNTSingleUseCard
