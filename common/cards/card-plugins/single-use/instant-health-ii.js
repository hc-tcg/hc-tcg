import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {HERMIT_CARDS} from '../..'

class InstantHealthIISingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'instant_health_ii',
			name: 'Instant Health II',
			rarity: 'rare',
			description: 'Heal active or AFK Hermit 60hp.',
			pickOn: 'apply',
			pickReqs: [{target: 'player', slot: ['hermit', 'effect'], type: ['hermit'], amount: 1}],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const pickedCards = pickedSlots[this.id] || []
			if (pickedCards.length !== 1) return

			const row = pickedCards[0].row?.state
			if (!row || !row.health) return
			const card = row.hermitCard
			if (!card) return
			const hermitInfo = HERMIT_CARDS[card.cardId]
			if (hermitInfo) {
				row.health = Math.min(row.health + 60, hermitInfo.health)
			} else {
				// Armor Stand
				row.health += 60
			}
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default InstantHealthIISingleUseCard
