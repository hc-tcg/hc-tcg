import {GameModel} from '../../../models/game-model'
import {query, row, slot} from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class Mending extends Card {
	pickCondition = query.every(
		slot.currentPlayer,
		slot.attachSlot,
		slot.empty,
		slot.row(row.hasHermit),
		query.not(slot.frozen),
		query.not(slot.activeRow)
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
				query.every(slot.activeRow, slot.attachSlot, query.not(slot.frozen), query.not(slot.empty))
			)
		),
		log: (values) =>
			`${values.defaultLog} to move $e${values.pick.name}$ to $p${values.pick.hermitCard}$`,
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: 'Pick an empty effect slot from one of your AFK Hermits',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				const hermitActive = game.findSlot(slot.player, slot.activeRow, slot.attachSlot)

				if (!hermitActive || !hermitActive.rowId) return

				const logInfo = pickedSlot
				logInfo.cardId = hermitActive.rowId.effectCard

				// Apply the mending card
				applySingleUse(game, logInfo)

				// Move the effect card
				game.swapSlots(hermitActive, pickedSlot)
			},
		})
	}
}

export default Mending
