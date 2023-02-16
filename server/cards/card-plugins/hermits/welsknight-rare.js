import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

class WelsknightRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'welsknight_rare',
			name: 'Wels',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 280,
			primary: {
				name: "Knight's Blade",
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Vengeance',
				cost: ['pvp', 'pvp', 'pvp'],
				damage: 100,
				power:
					"If Welsknight's HP is orange, Vengeance does +20HP damage.\n\nIf Welsknight's HP is red, Vengeance does +50HP damage.",
			},
		})
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, typeAction, currentPlayer, playerActiveRow} =
				derivedState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			let extraDamage = 0
			if (playerActiveRow.health < 200) extraDamage += 20
			if (playerActiveRow.health < 100) extraDamage += 30

			target.extraHermitDamage += extraDamage

			return target
		})
	}
}

export default WelsknightRareHermitCard
