import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'
import {
	applySingleUse,
	rowHasItem,
	getTotalItemCardsValue,
} from '../../../../server/utils'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 * @typedef {import('common/types/cards').CardPos} CardPos
 */

class GoldenAxeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'golden_axe',
			name: 'Golden Axe',
			rarity: 'rare',
			description:
				"Do an additional 20hp damage for every item card attached to your opponent's Hermit up to a maximum of 80hp damage.",
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {otherPlayer} = pos

		if (otherPlayer.board.activeRow === null) return 'NO'
		const activeRow = otherPlayer.board.rows[otherPlayer.board.activeRow]
		if (rowHasItem(activeRow)) return 'YES'

		return 'NO'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, otherPlayer} = pos

		player.hooks.getAttacks[instance] = () => {
			const index = player.board.activeRow
			if (index === null) return []
			const row = player.board.rows[index]
			if (!row || !row.hermitCard) return []

			const opponentIndex = otherPlayer.board.activeRow
			if (!opponentIndex) return []
			const opponentRow = otherPlayer.board.rows[opponentIndex]
			if (!opponentRow || !opponentRow.hermitCard) return []

			const multiplier = getTotalItemCardsValue(opponentRow)
			const attack = new AttackModel({
				id: this.getInstanceKey(instance),
				attacker: {index, row},
				target: {index: opponentIndex, row: opponentRow},
				type: 'effect',
			}).addDamage(Math.min(80, 20 * multiplier))

			return [attack]
		}

		player.hooks.onAttack[instance] = (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId) return

			applySingleUse(game)
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		delete player.hooks.getAttacks[instance]
		delete player.hooks.onAttack[instance]
	}
}

export default GoldenAxeSingleUseCard
