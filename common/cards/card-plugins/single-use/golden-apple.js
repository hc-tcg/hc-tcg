import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {HERMIT_CARDS} from '../..'
import {getNonEmptyRows, isActive} from '../../../../server/utils'

class GoldenAppleSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'golden_apple',
			name: 'Golden Apple',
			rarity: 'ultra_rare',
			description: 'Heal AFK Hermit 100hp.',
			pickOn: 'apply',
			pickReqs: [{target: 'player', type: ['hermit'], amount: 1, active: false}],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onApply[instance] = (pickedSlots, modalResult) => {
			const pickedCards = pickedSlots[this.id] || []
			if (pickedCards.length !== 1) return

			const row = pickedCards[0].row?.state
			if (!row || !row.health) return
			const card = row.hermitCard
			if (!card) return
			const hermitInfo = HERMIT_CARDS[card.cardId]
			row.health = Math.min(row.health + 100, hermitInfo.health)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {player} = pos

		// Need active hermit to play
		if (!isActive(player)) return 'NO'

		// Can't attach it there are not any inactive hermits
		const inactiveHermits = getNonEmptyRows(player, false)
		if (inactiveHermits.length === 0) return 'NO'

		return 'YES'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.onApply[instance]
	}
}

export default GoldenAppleSingleUseCard
