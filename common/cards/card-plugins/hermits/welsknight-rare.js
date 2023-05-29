import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

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

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {condRef, moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			let extraDamage = 0
			if (condRef.row.health < 200) extraDamage += 20
			if (condRef.row.health < 100) extraDamage += 30

			target.extraHermitDamage += extraDamage

			return target
		})
	}
}

export default WelsknightRareHermitCard
