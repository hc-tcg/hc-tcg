import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const pickCondition = query.every(
	query.slot.currentPlayer,
	query.slot.attach,
	query.slot.empty,
	query.slot.row(query.row.hasHermit),
	query.not(query.slot.frozen),
	query.not(query.slot.active),
)

const Mending: SingleUse = {
	...singleUse,
	id: 'mending',
	numericId: 78,
	name: 'Mending',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 1,
	description:
		"Move your active Hermit's attached effect card to any of your AFK Hermits.",
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(SlotComponent, pickCondition),
		query.exists(
			SlotComponent,
			query.every(
				query.slot.active,
				query.slot.attach,
				query.not(query.slot.frozen),
				query.not(query.slot.empty),
			),
		),
	),
	log: (values) =>
		`${values.defaultLog} to move $e${
			values.game.currentPlayer.activeRow?.getAttach()?.props.name
		}$ to $p${values.pick.hermitCard}$`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message: 'Pick an empty effect slot from one of your AFK Hermits',
			canPick: pickCondition,
			onResult(pickedSlot) {
				const hermitActive = game.components.find(
					SlotComponent,
					query.slot.currentPlayer,
					query.slot.active,
					query.slot.attach,
				)

				// Apply the mending card
				applySingleUse(game, pickedSlot)

				// Move the effect card
				game.swapSlots(hermitActive, pickedSlot)
			},
		})
	},
}

export default Mending
