import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {flipCoin} from '../../utils/coinFlips'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const pickCondition = query.every(
	query.slot.opponent,
	query.slot.active,
	query.slot.item,
	query.not(query.slot.frozen),
	query.not(query.slot.empty),
)

const Looting: SingleUse = {
	...singleUse,
	id: 'looting',
	numericId: 83,
	name: 'Looting',
	expansion: 'default',
	rarity: 'rare',
	tokens: 0,
	description:
		"Flip a coin.\nIf heads, choose one item card attached to your opponent's active Hermit and add it to your hand.",
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(SlotComponent, pickCondition),
	),
	log: (values) => `${values.defaultLog}, and ${values.coinFlip}`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			const coinFlip = flipCoin(game, player, component)

			if (coinFlip[0] === 'tails') return

			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: 'Pick an item card to add to your hand',
				canPick: pickCondition,
				onResult(pickedSlot) {
					const card = pickedSlot.card
					if (!card) return
					card.draw(player.entity)
				},
			})
		})
	},
}

export default Looting
