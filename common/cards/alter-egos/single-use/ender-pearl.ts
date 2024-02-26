import { AttackModel } from '../../../models/attack-model'
import { CardPosModel } from '../../../models/card-pos-model'
import { GameModel } from '../../../models/game-model'
import { executeAttacks } from '../../../utils/attacks'
import { applySingleUse, getActiveRowPos } from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class EnderPearlSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'ender_pearl',
			numericId: 141,
			name: 'Ender Pearl',
			rarity: 'common',
			description:
				'Move your active Hermit and any attached cards to an open slot on your board.\n\nSubtract 10 health from this Hermit.',
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const { player } = pos
		if (player.board.activeRow === undefined) return 'NO'
		for (const row of player.board.rows) {
			if (row.hermitCard === null) return 'YES'
		}
		return 'NO'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const { player } = pos
		const attackId = this.getInstanceKey(instance)

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an empty Hermit slot',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_WRONG_PLAYER'

				const rowIndex = pickResult.rowIndex
				if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
				// We need to have no card there
				if (pickResult.card) return 'FAILURE_INVALID_SLOT'

				// Apply
				applySingleUse(game)

				// Move us
				if (player.board.activeRow === null) return 'FAILURE_INVALID_DATA'
				game.swapRows(player, player.board.activeRow, rowIndex)

				const activeRow = getActiveRowPos(player)
				if (activeRow) {
					// Do 10 damage
					const attack = new AttackModel({
						id: attackId,
						attacker: activeRow,
						target: activeRow,
						type: 'effect',
						isBacklash: true
					}).addDamage(this.id, 10)
					executeAttacks(game, [attack], true)
				}

				return 'SUCCESS'
			},
		})
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default EnderPearlSingleUseCard
