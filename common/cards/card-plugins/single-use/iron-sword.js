import SingleUseCard from './_single-use-card'
import {GameModel} from '../../../../server/models/game-model'
import {AttackModel} from '../../../../server/models/attack-model'
import {applySingleUse} from '../../../../server/utils'

class IronSwordSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'iron_sword',
			name: 'Iron Sword',
			rarity: 'common',
			description:
				'Does +20hp damage to opposing Hermit.\n\nDiscard after use.',
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {currentPlayer, opponentPlayer} = game.ds

		currentPlayer.hooks.getAttacks[instance] = () => {
			const index = currentPlayer.board.activeRow
			if (!index) return []
			const row = currentPlayer.board.rows[index]
			if (!row || !row.hermitCard) return []

			const opponentIndex = opponentPlayer.board.activeRow
			if (!opponentIndex) return []
			const opponentRow = opponentPlayer.board.rows[opponentIndex]
			if (!opponentRow || !opponentRow.hermitCard) return []

			const swordAttack = new AttackModel({
				id: this.getInstanceKey(instance, 'attack'),
				attacker: {index, row},
				target: {index: opponentIndex, row: opponentRow},
				type: 'effect',
			}).addDamage(20)

			return [swordAttack]
		}

		currentPlayer.hooks.afterAttack[instance] = (attackResult) => {
			const attackId = this.getInstanceKey(instance, 'attack')
			if (attackResult.attack.id !== attackId) return

			// We've executed our attack, apply effect
			// @TODO helper function?
			currentPlayer.board.singleUseCardUsed = true
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		const {currentPlayer} = game.ds
		delete currentPlayer.hooks.getAttacks[instance]
		delete currentPlayer.hooks.afterAttack[instance]
	}
}

export default IronSwordSingleUseCard
