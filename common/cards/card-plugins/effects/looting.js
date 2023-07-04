import EffectCard from './_effect-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class LootingEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'looting',
			name: 'Looting',
			rarity: 'rare',
			description:
				"If you attacked this turn, flip a coin. If heads, draw a card from your opponent's deck instead of your own.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		const coinFlipKey = this.getInstanceKey(instance, 'coinFlipKey')

		player.hooks.afterAttack[instance] = (attack) => {
			const {activeRow, rows} = player.board

			// Make sure the attack is a hermit attack
			if (!attack.isType('primary', 'secondary')) return

			// Make sure looting is on the active row
			if (activeRow === null) return
			if (activeRow !== pos.rowIndex) return

			const coinFlip = flipCoin(player, this.id)
			player.custom[coinFlipKey] = coinFlip
		}

		player.hooks.onTurnEnd[instance] = (drawCards) => {
			const coinFlip = player.custom[coinFlipKey]
			if (coinFlip && coinFlip[0] === 'heads') {
				const drawCard = opponentPlayer.pile.shift()
				if (drawCard) drawCards.push(drawCard)
			}
			delete player.custom[coinFlipKey]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		delete player.hooks.afterAttack[instance]
		delete opponentPlayer.hooks.onTurnEnd[instance]
	}
}

export default LootingEffectCard
