import EffectCard from './_effect-card'
import {discardCard} from '../../../utils'

class GoldArmorEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'gold_armor',
			name: 'Gold Armor',
			rarity: 'common',
			description:
				'Protects from the first +30hp damage taken.\n\nDiscard following any damage taken.',
		})
		this.protection = {target: 30, discard: true}
	}
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			if (target.effectCardId === this.id) {
				target.protection += this.protection.target
				// TODO - what to do in case of invis potion 0x?
				discardCard(game, target.row.effectCard)
			}
			return target
		})
	}
}

export default GoldArmorEffectCard
