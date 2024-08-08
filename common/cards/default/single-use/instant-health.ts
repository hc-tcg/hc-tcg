import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

const pickCondition = query.every(
	query.slot.hermit,
	query.not(query.slot.empty),
)

const InstantHealth: SingleUse = {
	...singleUse,
	id: 'instant_health',
	numericId: 42,
	name: 'Instant Health',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	description: 'Heal one of your Hermits 30hp.',
	attachCondition: query.every(
		singleUse.attachCondition,
		query.slot.playerHasActiveHermit,
		query.exists(SlotComponent, pickCondition),
	),
	log: (values) =>
		`${values.defaultLog} on $p${values.pick.name}$ and healed $g30hp$`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message: 'Pick an active or AFK Hermit',
			canPick: pickCondition,
			onResult(pickedSlot) {
				if (!pickedSlot.onBoard()) return
				// Apply
				pickedSlot.row?.heal(30)
				applySingleUse(game, pickedSlot)
			},
		})
	},
}

export default InstantHealth
