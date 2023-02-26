import HermitCard from './_hermit-card'
import {flipCoin} from '../../../utils'
import CARDS from '../../../cards'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class RendogRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'rendog_rare',
			name: 'Rendog',
			rarity: 'rare',
			hermitType: 'builder',
			health: 290,
			primary: {
				name: "Comin' At Ya",
				cost: ['builder'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Role Play',
				cost: ['builder', 'builder', 'builder'],
				damage: 0,
				power: 'Ren mimics special move of the opposing Hermit.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {playerActiveRow, opponentActiveRow} = game.ds
			const {attackerHermitCard, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (attackerHermitCard.cardId !== this.id) return target

			// uhmm, yeah...

			return target
		})
	}
}

export default RendogRareHermitCard
