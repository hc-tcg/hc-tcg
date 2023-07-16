import HermitCard from './_hermit-card'
import {getNonEmptyRows} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

/**
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class IJevinRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'ijevin_rare',
			name: 'Jevin',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 300,
			primary: {
				name: 'Your Boi',
				cost: ['any'],
				damage: 30,
				power: null,
			},
			secondary: {
				name: 'Peace Out',
				cost: ['speedrunner', 'speedrunner', 'any'],
				damage: 90,
				power:
					'After attack, your opponent must choose an AFK Hermit to replace their active Hermit, unless they have no AFK Hermits. ',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack.add(instance, (attack, pickedSlots) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'secondary' || !attack.target) return

			const opponentInactiveRows = getNonEmptyRows(opponentPlayer, false)
			if (opponentInactiveRows.length !== 0 && attack.target.row.health) {
				attack.target.row.ailments.push({
					id: 'knockedout',
					duration: 1,
				})
				opponentPlayer.board.activeRow = null
			}
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos

		player.hooks.onAttack.remove(instance)
	}
}

export default IJevinRareHermitCard
