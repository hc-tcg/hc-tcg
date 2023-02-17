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
	register(game) {}
}

export default GoldArmorEffectCard
