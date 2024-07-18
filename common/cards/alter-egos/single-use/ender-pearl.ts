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
				if (!pickedSlot.inRow() || !player.activeRow) return

				// Apply
				applySingleUse(game, pickedSlot)

				// Move us
				game.swapRows(player.activeRow, pickedSlot.row)

				// Do 10 damage
				const attack = game
					.newAttack({
						attacker: pickedSlot.getCard()?.entity,
						target: player.activeRowEntity,
						type: 'effect',
						isBacklash: true,
					})
					.addDamage(this.id, 10)
				executeAttacks(game, [attack], true)
			},
		})
	}
}

export default EnderPearl
