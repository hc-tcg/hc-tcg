import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class LlamadadRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'llamadad_rare',
			name: 'Llamadad',
			rarity: 'rare',
			hermitType: 'balanced',
			health: 290,
			primary: {
				name: 'Spitz',
				cost: ['balanced'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Matilda',
				cost: ['balanced', 'balanced'],
				damage: 80,
				power:
					'Flip a coin.\n\nIf heads, Matilda does an additional 40hp damage.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			target.extraHermitDamage += coinFlip[0] === 'heads' ? 40 : 0

			return target
		})
	}
}

export default LlamadadRareHermitCard
