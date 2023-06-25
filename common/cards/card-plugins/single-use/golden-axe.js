import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'
import {
	applySingleUse,
	rowHasItem,
	getItemCardsEnergy,
	getActiveRowPos,
} from '../../../../server/utils'

/**
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
		const {opponentPlayer} = pos

		if (opponentPlayer.board.activeRow === null) return 'NO'
		const activeRow = opponentPlayer.board.rows[opponentPlayer.board.activeRow]
		if (rowHasItem(activeRow)) return 'YES'

		return 'NO'
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks[instance] = () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []
			const opponentActivePos = getActiveRowPos(opponentPlayer)
			if (!opponentActivePos) return []

			const multiplier = getItemCardsEnergy(game, opponentActivePos.row)
			const attack = new AttackModel({
				id: this.getInstanceKey(instance),
				attacker: activePos,
				target: opponentActivePos,
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
