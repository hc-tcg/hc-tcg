import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {
	CardComponent,
	HandSlotComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class Looting extends Card {
	pickCondition = query.every(
		query.slot.opponent,
		query.slot.activeRow,
		query.slot.itemSlot,
		query.not(query.slot.empty)
	)

	props: SingleUse = {
		...singleUse,
		id: 'looting',
		numericId: 76,
		name: 'Looting',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		description:
			"Flip a coin.\nIf heads, choose one item card attached to your opponent's active Hermit and add it to your hand.",
		showConfirmationModal: true,
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.pickCondition)
		),
		log: (values) => `${values.defaultLog}, and ${values.coinFlip}`,
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			const coinFlip = flipCoin(player, component)

			if (coinFlip[0] === 'tails') return

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: 'Pick an item card to add to your hand',
				canPick: this.pickCondition,
				onResult(pickedSlot) {
					const card = pickedSlot.getCard()
					if (!card) return
					card.attach(card.game.components.new(HandSlotComponent, opponentPlayer.entity))
				},
			})
		})
	}
}

export default Looting
