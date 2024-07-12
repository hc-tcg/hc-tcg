import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class LadderSingleUseCard extends Card {
	pickCondition = query.every(
		slot.currentPlayer,
		slot.hermitSlot,
		query.not(slot.empty),
		slot.adjacentTo(slot.activeRow)
	)

	props: SingleUse = {
		...singleUse,
		id: 'ladder',
		numericId: 143,
		name: 'Ladder',
		expansion: 'alter_egos',
		rarity: 'ultra_rare',
		tokens: 2,
		description:
			'Before your attack, swap your active Hermit card with one of your adjacent AFK Hermit cards.\nAll cards attached to both Hermits, including health, remain in place. Your active Hermit remains active after swapping.',
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.pickCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: 'Pick an AFK Hermit adjacent to your active Hermit',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				if (!pickedSlot.onBoard() || !pickedSlot.row) return
				applySingleUse(game, component.slot)
				game.swapSlots(
					pickedSlot,
					game.components.find(SlotComponent, slot.currentPlayer, slot.hermitSlot, slot.activeRow)
				)
				game.changeActiveRow(player, pickedSlot.row)
			},
		})
	}
}

export default LadderSingleUseCard
