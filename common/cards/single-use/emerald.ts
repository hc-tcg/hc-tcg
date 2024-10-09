import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const Emerald: SingleUse = {
	...singleUse,
	id: 'emerald',
	numericId: 18,
	name: 'Emerald',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	description:
		"Steal or swap the attached effect card of your opponent's active Hermit.",
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(
			SlotComponent,
			query.every(
				query.slot.currentPlayer,
				query.slot.active,
				query.slot.attach,
				query.not(query.slot.frozen),
			),
		),
		query.exists(
			SlotComponent,
			query.every(
				query.slot.opponent,
				query.slot.active,
				query.slot.attach,
				query.not(query.slot.frozen),
			),
		),
	),
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			const playerSlot = game.components.find(
				SlotComponent,
				query.slot.currentPlayer,
				query.slot.active,
				query.slot.attach,
			)
			const opponentSlot = game.components.find(
				SlotComponent,
				query.slot.opponent,
				query.slot.active,
				query.slot.attach,
			)

			game.swapSlots(playerSlot, opponentSlot)
		})
	},
}

export default Emerald
