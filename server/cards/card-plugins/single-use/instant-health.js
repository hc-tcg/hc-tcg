import SingleUseCard from './_single-use-card'
import CARDS from '../../index'

class InstantHealthSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'instant_health',
			name: 'Instant Health',
			rarity: 'common',
			description:
				'Heals +30hp.\n\nCan be used on active or AFK Hermits.\n\nDiscard after use.',
		})
	}
	register(game) {
		game.hooks.applyEffect.tap(this.id, (action, derivedState) => {
			const {singleUseInfo, pickedRow, pickedCardInfo} = derivedState
			if (singleUseInfo?.id === this.id) {
				pickedRow.health = Math.min(
					pickedRow.health + 30,
					pickedCardInfo.health // max health
				)
				return 'DONE'
			}
		})
	}
}

export default InstantHealthSingleUseCard
