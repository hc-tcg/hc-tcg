import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {applySingleUse} from '../../utils/board'
import {getFormattedName} from '../../utils/game'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const firstPickCondition = query.every(
	query.slot.currentPlayer,
	query.slot.item,
	query.slot.row(query.row.hasHermit),
	query.not(query.slot.frozen),
	query.not(query.slot.empty),
	// This condition needs to be different than the one for the second pick request in this case
	// The reason is that we don't know the row that's chosen until after the first pick request is over
	query.slot.adjacent(
		query.every(
			query.slot.row(query.row.hasHermit),
			query.slot.item,
			query.slot.empty,
			query.not(query.slot.frozen),
		),
	),
)

const Piston: SingleUse = {
	...singleUse,
	id: 'piston',
	numericId: 120,
	name: 'Piston',
	expansion: 'alter_egos',
	rarity: 'common',
	tokens: 0,
	description:
		'Move one of your attached item cards to an adjacent Hermit.\nYou can use another single use effect card this turn.',
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(SlotComponent, firstPickCondition),
	),
	log: (values) =>
		`${values.defaultLog} to move ${getFormattedName(values.pick.id, false)}`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		let pickedItemSlot: SlotComponent | null = null

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message: 'Pick an item card from one of your active or AFK Hermits',
			canPick: firstPickCondition,
			onResult(pickResult) {
				// Store the component of the chosen item
				pickedItemSlot = pickResult
			},
		})

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message:
				'Pick an empty item slot on one of your adjacent active or AFK Hermits',
			canPick: query.every(
				query.slot.currentPlayer,
				query.slot.item,
				query.slot.empty,
				query.slot.row(query.row.hasHermit),
				query.not(query.slot.frozen),
				query.slot.adjacent((game, pos) =>
					query.slot.entity(pickedItemSlot?.entity)(game, pos),
				),
			),
			onResult(pickedSlot) {
				// Move the card and apply su card
				game.swapSlots(pickedItemSlot, pickedSlot)
				applySingleUse(game, pickedSlot)

				if (component.slot.onBoard()) component.discard()
				// Remove playing a single use from completed actions so it can be done again
				game.removeCompletedActions('PLAY_SINGLE_USE_CARD')
				player.singleUseCardUsed = false
			},
		})
	},
}

export default Piston
