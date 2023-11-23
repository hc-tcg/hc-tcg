import {AttackModel} from '../../models/attack-model'
import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {applySingleUse, getActiveRowPos, getNonEmptyRows} from '../../utils/board'
import {flipCoin} from '../../utils/coinFlips'
import SingleUseCard from '../base/single-use-card'

class EggSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'egg',
			numericId: 140,
			name: 'Egg',
			rarity: 'rare',
			description:
				'Choose one of your opponent AFK Hermits to make active after your attack.\n\nFlip a coin. If heads, also do 10hp damage to that Hermit.',
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const {opponentPlayer} = pos

		const inactiveHermits = getNonEmptyRows(opponentPlayer, false)
		if (inactiveHermits.length === 0) return 'NO'

		return 'YES'
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
					if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_WRONG_PLAYER'

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

		player.hooks.onAttack.add(instance, (attack) => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return []

			const targetIndex: number = player.custom[targetKey]
			if (!targetIndex) return
			const targetRow = opponentPlayer.board.rows[targetIndex]
			if (!targetRow || !targetRow.hermitCard) return

			applySingleUse(game)

			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] === 'heads') {
				const eggAttack = new AttackModel({
					id: this.getInstanceKey(instance),
					attacker: activePos,
					target: {
						player: opponentPlayer,
						rowIndex: targetIndex,
						row: targetRow,
					},
					type: 'effect',
				}).addDamage(this.id, 10)

				attack.addNewAttack(eggAttack)
			}

			// Only do this once if there are multiple attacks
			player.hooks.onAttack.remove(instance)
		})

		player.hooks.onApply.add(instance, () => {
			player.hooks.afterAttack.add(instance, (attack) => {
				const targetIndex = player.custom[targetKey]
				opponentPlayer.board.activeRow = targetIndex

				delete player.custom[targetKey]

				player.hooks.afterAttack.remove(instance)
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const targetKey = this.getInstanceKey(instance, 'target')

		player.hooks.getAttackRequests.remove(instance)
		player.hooks.onAttack.remove(instance)
		player.hooks.onApply.remove(instance)
		delete player.custom[targetKey]
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default EggSingleUseCard
