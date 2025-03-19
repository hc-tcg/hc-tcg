import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const pickCondition = query.every(
	query.slot.hermit,
	query.not(query.slot.active),
	query.not(query.slot.empty),
)

const GoldenApple: SingleUse = {
	...singleUse,
	id: 'golden_apple',
	numericId: 74,
	name: 'Golden Apple',
	expansion: 'default',
	rarity: 'ultra_rare',
	tokens: 2,
	description: 'Heal one of your AFK Hermits 100hp.',
	log: (values) =>
		`${values.defaultLog} on $p${values.pick.name}$ and healed $g100hp$`,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.slot.playerHasActiveHermit,
		query.exists(SlotComponent, pickCondition),
	),
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player} = component

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message: 'Pick one of your AFK Hermits',
			canPick: pickCondition,
			onResult(pickedSlot) {
				if (!pickedSlot.onBoard())
					throw new Error('Can not pick slot that is not on board')
				// Apply
				applySingleUse(game, pickedSlot)

				pickedSlot.row?.heal(100)
			},
		})
	},
}

export default GoldenApple
