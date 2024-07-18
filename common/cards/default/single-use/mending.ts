import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class Mending extends Card {
	pickCondition = query.every(
		query.slot.currentPlayer,
		query.slot.attach,
		query.slot.empty,
		query.slot.row(query.row.hasHermit),
		query.not(query.slot.frozen),
		query.not(query.slot.active)
	)

	props: SingleUse = {
		...singleUse,
		id: 'mending',
		numericId: 78,
		name: 'Mending',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 1,
		description: "Move your active Hermit's attached effect card to any of your AFK Hermits.",
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.pickCondition),
			query.exists(
				SlotComponent,
				query.every(
					query.slot.active,
					query.slot.attach,
					query.not(query.slot.frozen),
					query.not(query.slot.empty)
				)
			)
		),
		log: (values) =>
			`${values.defaultLog} to move $e${values.pick.name}$ to $p${values.pick.hermitCard}$`,
	}

	override onAttach(game: GameModel, component: CardComponent, _observer: ObserverComponent) {
		const {player} = component

		game.addPickRequest({
			playerId: player.id,
			id: component.entity,
			message: 'Pick an empty effect slot from one of your AFK Hermits',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				const hermitActive = game.components.find(
					SlotComponent,
					query.slot.currentPlayer,
					query.slot.active,
					query.slot.attach
				)

				// Apply the mending card
				applySingleUse(game, component.slot)

				// Move the effect card
				game.swapSlots(hermitActive, pickedSlot)
			},
		})
	}
}

export default Mending
