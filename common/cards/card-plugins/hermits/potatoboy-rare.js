import HermitCard from './_hermit-card'
import {HERMIT_CARDS} from '../../../cards'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'

class PotatoBoyRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'potatoboy_rare',
			name: 'Potato Boy',
			rarity: 'rare',
			hermitType: 'farm',
			health: 270,
			primary: {
				name: 'Peace & Love',
				cost: ['farm'],
				damage: 0,
				power: 'Heals Hermit directly above and below for 40hp.',
			},
			secondary: {
				name: 'Volcarbo',
				cost: ['farm', 'farm', 'any'],
				damage: 90,
				power: null,
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos

		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'primary') return

			const activeRow = player.board.activeRow
			if (activeRow === null) return

			const rows = player.board.rows

			const targetRows = [rows[activeRow - 1], rows[activeRow + 1]].filter(Boolean)

			targetRows.forEach((row) => {
				if (!row.hermitCard) return
				const currentRowInfo = HERMIT_CARDS[row.hermitCard.cardId]
				if (!currentRowInfo) return
				row.health = Math.min(row.health + 40, currentRowInfo.health)
			})
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		// Remove hooks
		delete player.hooks.onAttack[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}

	getPalette() {
		return 'alter_egos'
	}

	getBackground() {
		return 'alter_egos_background'
	}
}

export default PotatoBoyRareHermitCard
