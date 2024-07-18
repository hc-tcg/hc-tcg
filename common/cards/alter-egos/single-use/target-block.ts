import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class TargetBlock extends Card {
	pickCondition = query.every(
		query.slot.opponent,
		query.slot.hermitSlot,
		query.not(query.slot.activeRow),
		query.not(query.slot.empty)
	)

	props: SingleUse = {
		...singleUse,
		id: 'target_block',
		numericId: 149,
		name: 'Target Block',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 3,
		description:
			"Choose one of your opponent's AFK Hermits to take all damage done during this turn.",
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.pickCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		game.addPickRequest({
			playerId: player.id,
			id: component.entity,
			message: "Pick one of your opponent's AFK Hermits",
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				if (!pickedSlot.inRow()) return
				// Apply the card
				applySingleUse(game, pickedSlot)

				// Redirect all future attacks this turn
				observer.subscribe(player.hooks.beforeAttack, (attack) => {
					if (attack.isType('status-effect') || attack.isBacklash) return

					attack.setTarget(this.id, pickedSlot.row.entity)
				})
			},
		})
	}
}

export default TargetBlock
