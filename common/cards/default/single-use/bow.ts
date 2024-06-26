import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {applySingleUse, getActiveRowPos} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class BowSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'bow',
			numericId: 3,
			name: 'Bow',
			rarity: 'common',
			description: "Do 40hp damage to one of your opponent's AFK Hermits.",
			log: null,
		})
	}

	pickCondition = slot.every(
		slot.opponent,
		slot.hermitSlot,
		slot.not(slot.empty),
		slot.not(slot.activeRow)
	)

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFulfills(this.pickCondition)
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const targetKey = this.getInstanceKey(instance, 'target')

		player.hooks.getAttackRequests.add(instance, () => {
			game.addPickRequest({
				playerId: player.id,
				id: this.id,
				message: "Pick one of your opponent's AFK Hermits",
				canPick: this.pickCondition,
				onResult(pickedSlot) {
					const rowIndex = pickedSlot.rowIndex
					if (rowIndex === null) return

					player.custom[targetKey] = rowIndex
				},
				onTimeout() {
					// We didn't pick a target so do nothing
				},
			})
		})

		player.hooks.getAttack.add(instance, () => {
			const activePos = getActiveRowPos(player)
			if (!activePos) return null

			const opponentIndex = player.custom[targetKey]
			if (opponentIndex === null || opponentIndex === undefined) return null
			const opponentRow = opponentPlayer.board.rows[opponentIndex]
			if (!opponentRow || !opponentRow.hermitCard) return null

			const bowAttack = new AttackModel({
				id: this.getInstanceKey(instance),
				attacker: activePos,
				target: {
					player: opponentPlayer,
					rowIndex: opponentIndex,
					row: opponentRow,
				},
				type: 'effect',
				log: (values) =>
					`${values.defaultLog} to attack ${values.target} for ${values.damage} damage`,
			}).addDamage(this.id, 40)

			return bowAttack
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId) return

			applySingleUse(game)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttackRequests.remove(instance)
		player.hooks.getAttack.remove(instance)
		player.hooks.onAttack.remove(instance)

		const targetKey = this.getInstanceKey(instance, 'target')
		delete player.custom[targetKey]
	}

	override canAttack() {
		return true
	}
}

export default BowSingleUseCard
