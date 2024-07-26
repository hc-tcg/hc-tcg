import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import {getFormattedName} from '../../../utils/game'
import * as query from '../../../components/query'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'

class FireCharge extends Card {
	pickCondition = query.every(
		query.slot.currentPlayer,
		query.not(query.slot.frozen),
		query.not(query.slot.empty),
		query.some(query.slot.item, query.slot.attach)
	)

	props: SingleUse = {
		...singleUse,
		id: 'fire_charge',
		numericId: 142,
		name: 'Fire Charge',
		expansion: 'alter_egos',
		rarity: 'common',
		tokens: 0,
		description:
			'Discard one attached item or effect card from any of your Hermits.\nYou can use another single use effect card this turn.',
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.pickCondition)
		),
		log: (values) => `${values.defaultLog} to discard ${getFormattedName(values.pick.id, false)}`,
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		game.addPickRequest({
			playerId: player.id,
			id: component.entity,
			message: 'Pick an item or effect card from one of your active or AFK Hermits',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				applySingleUse(game, pickedSlot)
				pickedSlot.getCard()?.discard()

				if (component.slot.onBoard()) component.discard()
				// Remove playing a single use from completed actions so it can be done again
				game.removeCompletedActions('PLAY_SINGLE_USE_CARD')
				player.singleUseCardUsed = false
			},
		})
	}
}

export default FireCharge
