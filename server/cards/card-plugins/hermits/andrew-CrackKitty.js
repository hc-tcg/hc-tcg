import CharacterCard from './_character-card'
import {flipCoin, discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class CrackKittyCharacterCard extends CharacterCard {
	constructor() {
		super({
			id: 'andrew-CrackKitty',
			name: 'Crack Kitty',
			rarity: 'rare',
			characterType: 'cat',
			health: 280,
			primary: {
				name: 'Cocaine',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Feral',
				cost: ['cat', 'any'],
				damage: 80,
				power:
					'Flip a Coin.\n\nIf heads, this attack give the opponent RABIES. Does an additional +20HP damage per turn until opponent is knocked out.\n\nGoing AFK does not eliminate the RABIES.',
			}, 
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, attackState) => {
			const {currentPlayer, opponentActiveRow, opponentEffectCardInfo} = game.ds
			const {attackerCharacterCard, typeAction} = attackState

			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target

			if (attackerCharacterCard.cardId !== this.id) return target
			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip

			if (coinFlip[0] === 'heads') {
				if (target.row.effectCard?.cardId !== 'drMario') {
					target.row.ailments.push({id: 'rabies', duration: -1})
				}
			}

			return target
		})
	}
}

export default CrackKittyCharacterCard
