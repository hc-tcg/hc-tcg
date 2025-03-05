import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {applySingleUse} from '../../utils/board'
import {getFormattedName} from '../../utils/game'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const pickCondition = query.every(
	query.slot.currentPlayer,
	query.not(query.slot.frozen),
	query.not(query.slot.empty),
	query.some(query.slot.item, query.slot.attach),
)

const FireCharge: SingleUse = {
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
		query.exists(SlotComponent, pickCondition),
	),
	log: (values) =>
		`${values.defaultLog} to discard ${getFormattedName(values.pick.id, false)}`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message:
				'Pick an item or effect card from one of your active or AFK Hermits',
			canPick: pickCondition,
			onResult(pickedSlot) {
				applySingleUse(game, pickedSlot)
				pickedSlot.card?.discard()

				if (component.slot.onBoard()) component.discard()
				// Remove playing a single use from completed actions so it can be done again
				game.removeCompletedActions('PLAY_SINGLE_USE_CARD')
				player.singleUseCardUsed = false
			},
		})
	},
}

export default FireCharge
