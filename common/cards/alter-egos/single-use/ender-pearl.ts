import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {executeAttacks} from '../../../utils/attacks'
import {applySingleUse, getActiveRowPos} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class EnderPearlSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'ender_pearl',
			numericId: 141,
			name: 'Ender Pearl',
			rarity: 'common',
			description:
				'Before your attack, move your active Hermit and any attached cards to an open row on your board. This Hermit also takes 10hp damage.',
			log: (values) =>
				`${values.defaultLog} to move $p${values.pick.name}$ to row #${values.pick.rowIndex}`,
		})
	}

	pickCondition = slot.every(slot.empty, slot.hermitSlot, slot.player)

	override _attachCondition = slot.every(
		super.attachCondition,
		slot.someSlotFulfills(this.pickCondition)
	)

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		const attackId = this.getInstanceKey(instance)

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an empty Hermit slot',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				const rowIndex = pickedSlot.rowIndex
				// We need to have no card there
				if (pickedSlot.card || rowIndex === null) return

				const activeRow = getActiveRowPos(player)
				if (player.board.activeRow === null || !activeRow) return

				const logInfo = pickedSlot
				logInfo.card = activeRow.row.hermitCard

				// Apply
				applySingleUse(game, logInfo)

				// Move us
				game.swapRows(player, player.board.activeRow, rowIndex)

				// Do 10 damage
				const attack = new AttackModel({
					id: attackId,
					attacker: activeRow,
					target: activeRow,
					type: 'effect',
					isBacklash: true,
				}).addDamage(this.id, 10)
				executeAttacks(game, [attack], true)
			},
		})
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default EnderPearlSingleUseCard
