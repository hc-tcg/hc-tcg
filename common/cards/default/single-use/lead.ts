import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {attach, item, singleUse} from '../../base/defaults'
import {opponent} from '../../../components/query/slot'

class Lead extends Card {
	firstPickCondition = query.every(
		query.slot.opponent,
		query.slot.item,
		query.not(query.slot.empty),
		query.slot.active,
		query.not(query.slot.frozen)
	)
	secondPickCondition = query.every(
		query.slot.opponent,
		query.slot.item,
		query.slot.empty,
		query.slot.row(query.row.hasHermit),
		query.not(query.slot.active),
		query.not(query.slot.frozen)
	)

	props: SingleUse = {
		...singleUse,
		id: 'lead',
		numericId: 75,
		name: 'Lead',
		expansion: 'default',
		rarity: 'common',
		tokens: 1,
		description:
			"Move one of your opponent's attached item cards from their active Hermit to any of their AFK Hermits.",
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.firstPickCondition),
			query.exists(SlotComponent, this.secondPickCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent, _observer: ObserverComponent) {
		const {player} = component
		let itemSlot: SlotComponent | null = null

		game.addPickRequest({
			playerId: player.id,
			id: component.entity,
			message: "Pick an item card attached to your opponent's active Hermit",
			canPick: this.firstPickCondition,
			onResult(pickedSlot) {
				itemSlot = pickedSlot
			},
		})

		game.addPickRequest({
			playerId: player.id,
			id: component.entity,
			message: "Pick an empty item slot on one of your opponent's AFK Hermits",
			canPick: this.secondPickCondition,
			onResult(pickedSlot) {
				if (!itemSlot || !pickedSlot.inRow()) return
				applySingleUse(game)

				// A custom entry is needed here because the battle log can't support doing this type of entry automatically at the moment
				game.battleLog.addEntry(
					player.entity,
					`$p{You|${player.playerName}}$ used $eLead$ to move $m${
						itemSlot.getCard()?.props.name
					}$ to $o${pickedSlot.row.getHermit()?.props.name} (${pickedSlot.row.index})$`
				)

				// Move the item
				game.swapSlots(itemSlot, pickedSlot)
			},
		})
	}
}

export default Lead
