import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class DungeonTangoRare extends CardOld {
	props: Hermit = {
		...hermit,
		id: 'dungeontango_rare',
		numericId: 208,
		name: 'DM tango',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 2,
		type: 'miner',
		health: 280,
		primary: {
			name: 'Lackey',
			cost: ['any'],
			damage: 40,
			power:
				'Discard 1 item card attached to this Hermit to draw a random Hermit card from your deck. If you have no more Hermit cards, keep the item card attached.',
		},
		secondary: {
			name: 'Ravager',
			cost: ['miner', 'miner', 'any'],
			damage: 90,
			power: null,
		},
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(
			player.hooks.getAttackRequests,
			(activeInstance, hermitAttackType) => {
				if (
					activeInstance.entity !== component.entity ||
					hermitAttackType !== 'primary'
				)
					return

				const hermitCard = player.getDeck().find((card) => card.isHermit())

				const pickCondition = query.every(
					query.slot.currentPlayer,
					query.slot.item,
					query.slot.active,
					query.not(query.slot.empty),
					query.not(query.slot.frozen),
				)

				if (!game.components.exists(SlotComponent, pickCondition)) return

				game.addPickRequest({
					playerId: player.id,
					id: component.entity,
					message: 'Choose an item card to discard',
					canPick: pickCondition,
					onResult(pickedSlot) {
						const pickedCard = pickedSlot.getCard()
						if (!pickedCard || !hermitCard) return

						pickedCard.discard()

						hermitCard.draw()
					},
				})
			},
		)
	}
}

export default DungeonTangoRare
