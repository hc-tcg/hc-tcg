import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import {getFormattedName} from '../../../utils/game'
import {query, slot} from '../../../components/query'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import {CardComponent, SlotComponent} from '../../../components'

class FireChargeSingleUseCard extends Card {
	pickCondition = query.every(
		slot.currentPlayer,
		query.not(slot.frozen),
		query.not(slot.empty),
		query.some(slot.itemSlot, slot.attachSlot)
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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		game.addPickRequest({
			playerId: player.id,
			id: this.props.id,
			message: 'Pick an item or effect card from one of your active or AFK Hermits',
			canPick: this.pickCondition,
			onResult(pickedSlot) {
				pickedSlot.getCard()?.discard()
				applySingleUse(game, pickedSlot)
			},
		})

		player.hooks.afterApply.add(component, () => {
			component.discard()
			// Remove playing a single use from completed actions so it can be done again
			game.removeCompletedActions('PLAY_SINGLE_USE_CARD')
			player.hooks.afterApply.remove(component)
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.afterApply.remove(component)
	}
}

export default FireChargeSingleUseCard
