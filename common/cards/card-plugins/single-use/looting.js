import SingleUseCard from './_single-use-card'
import {flipCoin} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class LootingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'looting',
			name: 'Looting',
			rarity: 'rare',
			description:
				"At the end of the turn, draw a card from your opponent's deck instead of your own.",
		})
	}

	canApply() {
		return true
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			player.hooks.onTurnEnd.add(instance, (drawCards) => {
				const drawCard = opponentPlayer.pile.shift()
				if (drawCard) drawCards.push(drawCard)

				player.hooks.onTurnEnd.remove(instance)
			})
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default LootingSingleUseCard
