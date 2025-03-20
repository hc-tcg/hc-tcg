import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {TargetBlockEffect} from '../../status-effects/target-block'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const pickCondition = query.every(
	query.slot.opponent,
	query.slot.hermit,
	query.not(query.slot.active),
	query.not(query.slot.empty),
)

const TargetBlock: SingleUse = {
	...singleUse,
	id: 'target_block',
	numericId: 149,
	name: 'Target Block',
	expansion: 'alter_egos',
	rarity: 'rare',
	tokens: 4,
	description:
		"Choose one of your opponent's AFK Hermits to take all damage done during this turn.",
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(SlotComponent, pickCondition),
	),
	log: (values) => `${values.defaultLog} on $o${values.pick.name}$`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message: "Pick one of your opponent's AFK Hermits",
			canPick: pickCondition,
			onResult(pickedSlot) {
				if (!pickedSlot.inRow()) return
				// Apply the card
				applySingleUse(game, pickedSlot)
				game.components
					.new(StatusEffectComponent, TargetBlockEffect, component.entity)
					.apply(pickedSlot.card?.entity)
			},
		})
	},
}

export default TargetBlock
