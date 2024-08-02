import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import {TargetBlockEffect} from '../../../status-effects/target-block'

class TargetBlock extends Card {
	pickCondition = query.every(
		query.slot.opponent,
		query.slot.hermit,
		query.not(query.slot.active),
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

	override onAttach(game: GameModel, component: CardComponent, _observer: ObserverComponent) {
		const {player} = component

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message: "Pick one of your opponent's AFK Hermits",
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				if (!pickedSlot.inRow()) return
				// Apply the card
				applySingleUse(game, pickedSlot)
				game.components
					.new(StatusEffectComponent, TargetBlockEffect, component.entity)
					.apply(pickedSlot.getCard()?.entity)
			},
		})
	}
}

export default TargetBlock
