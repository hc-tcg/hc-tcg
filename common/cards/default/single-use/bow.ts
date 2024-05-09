import {CARDS} from '../..'
import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRowPos, getNonEmptyRows} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class BowSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'bow',
			numericId: 3,
			name: 'Bow',
			rarity: 'common',
			description: "Do 40hp damage to one of your opponent's AFK Hermits.",
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)
		const {opponentPlayer} = pos

		// Check if there is an AFK Hermit
		const inactiveRows = getNonEmptyRows(opponentPlayer, true)
		if (inactiveRows.length === 0) result.push('UNMET_CONDITION')

		return result
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const targetKey = this.getInstanceKey(instance, 'target')

		player.hooks.getAttackRequests.add(instance, () => {
			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: "Pick one of your opponent's AFK Hermits",
				onResult(pickResult) {
					if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_INVALID_PLAYER'

					const rowIndex = pickResult.rowIndex
					if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
					if (rowIndex === opponentPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'

					if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
					if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

					// Store the row index to use later
					player.custom[targetKey] = rowIndex

					return 'SUCCESS'
				},
				onTimeout() {
					// We didn't pick a target so do nothing
				},
			})
		})

		player.hooks.getAttacks.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []

			const opponentIndex = player.custom[targetKey]
			if (opponentIndex === null || opponentIndex === undefined) return []
			const opponentRow = opponentPlayer.board.rows[opponentIndex]
			if (!opponentRow || !opponentRow.hermitCard) return []

			const bowAttack = new AttackModel({
				id: this.getInstanceKey(instance),
				attacker: activePos,
				target: {
					player: opponentPlayer,
					rowIndex: opponentIndex,
					row: opponentRow,
				},
				type: 'effect',
			}).addDamage(this.id, 40)

			return [bowAttack]
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId) return

			const targetHermitId = opponentPlayer.board.rows[player.custom[targetKey]].hermitCard?.cardId

			applySingleUse(game, [
				[`to attack `, 'plain'],
				[`${targetHermitId ? CARDS[targetHermitId].name : ''} `, 'opponent'],
			])
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.getAttacks.remove(instance)
		player.hooks.onAttack.remove(instance)

		const targetKey = this.getInstanceKey(instance, 'target')
		delete player.custom[targetKey]
	}

	override canAttack() {
		return true
	}
}

export default BowSingleUseCard
