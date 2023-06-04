import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

class DreamRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'dream_rare',
			name: 'Dream',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 290,
			primary: {
				name: "C'mere",
				cost: ['speedrunner', 'any'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Transition',
				cost: ['speedrunner', 'speedrunner', 'any'],
				damage: 90,
				power: 'Flip a Coin.\n\nIf heads, HP is set randomly between 10-290.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {typeAction, moveRef, attacker} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target
			if (moveRef.hermitCard.cardId !== this.id) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'tails') return target

			attacker.row.health = (Math.floor(Math.random() * 29) + 1) * 10

			return target
		})
	}
}

export default DreamRareHermitCard
