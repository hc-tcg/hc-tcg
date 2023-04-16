import CharacterCard from './_character-card'
import {flipCoin} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class OkuCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'oku',
			name: 'Oku',
			rarity: 'rare',
			characterType: 'australian',
			health: 260,
			primary: {
				name: 'Sonic Lore',
				cost: ['australian', 'australian'],
				damage: 70,
				power: null,
			},
			secondary: {
				name: 'Straight Lunge',
				cost: ['australian'],
				damage: 50,
				power:
					'Flip a Coin.\n\nIf heads, attack damage doubles.\n\nIf tails, its a regular attack.',
			},
		})

		this.headsMultiplier = 2
		this.tailsMultiplier = 1
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer} = game.ds
			const {attackerCharacterCard, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target

			if (attackerCharacterCard.cardId !== this.id) return target
			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				target.multiplier *= this.headsMultiplier
			} else if (coinFlip[0] === 'tails') {
				target.multiplier *= this.tailsMultiplier
			}

			return target
		})
	}
}

export default OkuCharacterCard
