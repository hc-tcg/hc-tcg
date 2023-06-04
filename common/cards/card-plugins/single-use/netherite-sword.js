import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'

class NetheriteSwordSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'netherite_sword',
			name: 'Netherite Sword',
			rarity: 'ultra_rare',
			description:
				'Does +60hp damage to opposing Hermit.\n\nDiscard after use.',
		})
		this.damage = {target: 60}
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

export default NetheriteSwordSingleUseCard
