import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

class DiamondSwordSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'diamond_sword',
			name: 'Diamond Sword',
			rarity: 'rare',
			description:
				'Does +40hp damage to opposing Hermit.\n\nDiscard after use.',
		})
		this.damage = {target: 40}
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target) => {
			const {singleUseInfo} = game.ds
			if (singleUseInfo?.id === this.id && target.isActive) {
				target.extraEffectDamage += this.damage.target
			}
			return target
		})
	}
}

export default DiamondSwordSingleUseCard
