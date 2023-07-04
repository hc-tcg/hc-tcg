import EffectCard from './_effect-card'
import {discardCard} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'
class BedEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'bed',
			name: 'Bed',
			rarity: 'ultra_rare',
			description:
				'When the hermit this card is attached to is knocked out, all attached cards are discarded, and the hermit card is returned to your hand.\n\nDoes not count as a knockout.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		// Give the current row sleeping for 3 turns
		const {player, row} = pos
		if (!row) return

		player.hooks.onHermitDeath[instance] = (hermitPos) => {
			if (hermitPos.rowIndex && hermitPos.rowIndex === pos.rowIndex) {
				// Return the hermit card to your hand
				const hermitCard = row.hermitCard
				row.hermitCard = null
				if (!hermitCard) return
				player.hand.push(hermitCard)

				// Discard the rest of the row
				discardCard(game, row.effectCard)
				row.itemCards.forEach((itemCard) => discardCard(game, itemCard))

				// Remove the active row
				player.board.activeRow = null

				// Prevent actual death
				return 'STOP'
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onHermitDeath[instance]
	}
}

export default BedEffectCard
