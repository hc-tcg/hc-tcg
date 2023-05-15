import EffectCard from './_effect-card'
import {discardCard} from '../../../utils'

/**
 * @typedef {import('models/game-model').GameModel} GameModel
 */

// TODO - Must work with Gemintay ability to use two single use cards per turn (should mend the first one)
class MendingEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'mending',
			name: 'Mending',
			rarity: 'ultra_rare',
			description:
				'When attached, user returns any "single use" card used to their deck.\n\nMending is then discarded.',
		})
	}

	/**
	 * @param {GameModel} game
	 */
	register(game) {
		game.hooks.discardCard
			.for('single_use')
			.tap(this.id, (card, singleUseSlot) => {
				if (!game.state.turnPlayerId) return
				const currentPlayer = game.state.players[game.state.turnPlayerId]
				if (!singleUseSlot) return

				const activeRow = currentPlayer.board.activeRow
				if (activeRow === null) return
				const effectCard = currentPlayer.board.rows[activeRow]?.effectCard
				if (effectCard?.cardId !== this.id) return

				// return single use card to deck at random location
				const randomIndex = Math.floor(
					Math.random() * (currentPlayer.pile.length + 1)
				)
				currentPlayer.pile.splice(randomIndex, 0, card)

				// clear single use card slot
				currentPlayer.board.singleUseCardUsed = false
				currentPlayer.board.singleUseCard = null

				// discard mending card from board
				discardCard(game, effectCard)

				// return anything to prevent card being moved to discard pile
				return this.id
			})
	}
}

export default MendingEffectCard
