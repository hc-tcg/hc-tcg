import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {CardRarityT, TokenCostT} from '../../types/cards'
import {applySingleUse} from '../../utils/board'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const pickCondition = query.every(
	query.slot.hermit,
	query.slot.currentPlayer,
	query.not(query.slot.empty),
)

function newInstantHealth(
	props: {
		id: string
		name: string
		rarity: CardRarityT
		numericId: number
		tokens: TokenCostT
	},
	amount: number,
): SingleUse {
	return {
		...singleUse,
		id: props.id,
		numericId: props.numericId,
		name: props.name,
		expansion: 'default',
		rarity: props.rarity,
		tokens: props.tokens,
		description: `Heal one of your Hermits ${amount}hp.`,
		attachCondition: query.every(
			singleUse.attachCondition,
			query.slot.playerHasActiveHermit,
			query.exists(SlotComponent, pickCondition),
		),
		log: (values) =>
			`${values.defaultLog} on $p${values.pick.name}$ and healed $g${amount}hp$`,
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
					pickedSlot.row?.heal(amount)
					applySingleUse(game, pickedSlot)
				},
			})
		},
	}
}

export const InstantHealth = newInstantHealth(
	{
		id: 'instant_health',
		name: 'Instant Health',
		rarity: 'common',
		numericId: 42,
		tokens: 0,
	},
	30,
)

export const InstantHealthII = newInstantHealth(
	{
		id: 'instant_health_ii',
		name: 'Instant Health II',
		rarity: 'rare',
		numericId: 43,
		tokens: 2,
	},
	60,
)
