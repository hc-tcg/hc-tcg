import HermitCard from './_hermit-card'
import {flipCoin, discardCard} from '../../../utils'

// Source: https://www.youtube.com/watch?v=YRIGhAnudcg 1:46

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class XisumavoidAltEgoHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'xisumavoid_altego',
			name: 'Xisuma',
			rarity: 'altego',
			hermitType: 'balanced',
			health: 280,
			primary: {
				name: 'Evil Inside',
				cost: [],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Derpcoin',
				cost: ['balanced', 'balanced'],
				damage: 80,
				power: "Flip a coin.\n\n If heads, disable one of the opposing hermit's moves",
			},
		})
	}
	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer, opponentActiveRow, opponentEffectCardInfo} = game.ds
			const {moveRef, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				//TODO: Implement disable target Hermit's move
			}

			return target
		})
	}
}

export default XisumavoidAltEgoHermitCard
