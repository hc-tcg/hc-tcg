import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const pickCondition = query.every(
	query.slot.currentPlayer,
	query.slot.hermit,
	query.not(query.slot.empty),
	query.not(query.slot.frozen),
	query.slot.adjacent(query.slot.active),
)

const Ladder: SingleUse = {
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
		query.exists(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.active,
			query.slot.hermit,
			query.not(query.slot.frozen),
		),
		query.exists(SlotComponent, pickCondition),
	),
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message: 'Pick an AFK Hermit adjacent to your active Hermit',
			canPick: pickCondition,
			onResult(pickedSlot) {
				if (!pickedSlot.onBoard() || !pickedSlot.row) return
				applySingleUse(game, component.slot)
				game.swapSlots(
					pickedSlot,
					game.components.find(
						SlotComponent,
						query.slot.currentPlayer,
						query.slot.hermit,
						query.slot.active,
					),
				)
				player.changeActiveRow(pickedSlot.row)
			},
		})
	},
}

export default Ladder
