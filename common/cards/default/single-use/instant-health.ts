import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import {query, slot} from '../../../filters'
import Card, {SingleUse} from '../../base/card'
import {singleUse} from '../../base/defaults'
import { CardComponent } from '../../../types/components'

class InstantHealthSingleUseCard extends Card {
	pickCondition = query.every(slot.hermitSlot, query.not(slot.empty))

	props: SingleUse = {
		...singleUse,
		id: 'instant_health',
		numericId: 42,
		name: 'Instant Health',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		description: 'Heal one of your Hermits 30hp.',
		attachCondition: query.every(
			singleUse.attachCondition,
			slot.playerHasActiveHermit,
			slot.someSlotFulfills(this.pickCondition)
		),
		log: (values) => `${values.defaultLog} on $p${values.pick.name}$ and healed $g30hp$`,
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: 'Pick an active or AFK Hermit',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				const rowIndex = pickedSlot.rowIndex
				if (!pickedSlot.cardId || rowIndex === null) return

				const row = player.board.rows[rowIndex]
				if (!row.health) return

				// Apply
				applySingleUse(game, pickedSlot)

				healHermit(row, 30)
			},
		})
	}
}

export default InstantHealthSingleUseCard
