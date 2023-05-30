import HermitCard from './_hermit-card'
import {flipCoin} from '../../../../server/utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

class EthosLabRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'ethoslab_rare',
			name: 'Etho',
			rarity: 'rare',
			hermitType: 'redstone',
			health: 280,
			primary: {
				name: 'Oh Snappers',
				cost: ['redstone'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Blue Fire',
				cost: ['redstone', 'redstone'],
				damage: 80,
				power:
					'Flip a Coin.\n\nIf heads, this attack also BURNs the opponent. Does an additional +20HP damage per turn until opponent is knocked out.\n\nGoing AFK does not eliminate the BURN.',
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
				const hasWaterBucket = target.row.effectCard?.cardId === 'water_bucket'
				const hasDamageEffect = target.row.ailments.some((a) =>
					['fire', 'poison'].includes(a.id)
				)
				if (!hasWaterBucket && !hasDamageEffect) {
					target.row.ailments.push({id: 'fire', duration: -1})
				}
			}

			return target
		})
	}
}

export default EthosLabRareHermitCard
