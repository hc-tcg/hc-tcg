import {AttackModel} from '../../../models/attack-model'
import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import {executeAttacks} from '../../../utils/attacks'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class EnderPearl extends Card {
	pickCondition = query.every(query.slot.empty, query.slot.hermitSlot, query.slot.currentPlayer)

	props: SingleUse = {
		...singleUse,
		id: 'ender_pearl',
		numericId: 141,
		name: 'Ender Pearl',
		expansion: 'alter_egos',
		rarity: 'common',
		tokens: 0,
		description:
			'Before your attack, move your active Hermit and any attached cards to an open row on your board. This Hermit also takes 10hp damage.',
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.pickCondition)
		),
		log: (values) =>
			`${values.defaultLog} to move $p${values.pick.name}$ to row #${values.pick.rowIndex}`,
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		game.addPickRequest({
			playerId: player.id,
			id: component.entity,
			message: 'Pick an empty Hermit slot',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				const rowIndex = pickedSlot.rowIndex
				// We need to have no card there
				if (pickedSlot.cardId || rowIndex === null) return
				let activeHermit = player.activeRow.getHermit()

				if (player.activeRow === null) return

				const logInfo = pickedSlot

				// Apply
				applySingleUse(game, logInfo)

				// Move us
				game.swapRows(player, player.activeRow, rowIndex)

				// Do 10 damage
				const attack = game.newAttack({
					attacker: player.activeRow,
					target: player.activeRow.entity,
					type: 'effect',
					isBacklash: true,
				}).addDamage(this.id, 10)
				executeAttacks(game, [attack], true)
			},
		})
	}
}

export default EnderPearl
