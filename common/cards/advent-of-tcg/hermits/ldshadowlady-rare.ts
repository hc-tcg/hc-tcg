import {
	CardComponent,
	ObserverComponent,
	RowComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class LDShadowLadyRare extends CardOld {
	props: Hermit = {
		...hermit,
		id: 'ldshadowlady_rare',
		numericId: 211,
		name: 'Lizzie',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 1,
		type: 'terraform',
		health: 290,
		primary: {
			name: 'Fairy Fort',
			cost: ['terraform'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Evict',
			cost: ['terraform', 'terraform', 'any'],
			damage: 90,
			power:
				"Move your opponent's active Hermit and any attached cards to an open slot on their board, if one is available.",
		},
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			if (
				!game.components.exists(
					SlotComponent,
					query.slot.opponent,
					query.slot.hermit,
					query.slot.active,
				)
			)
				return

			const pickCondition = query.every(
				query.slot.hermit,
				query.slot.opponent,
				query.slot.empty,
				query.not(query.slot.active),
			)

			if (!game.components.exists(SlotComponent, pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: "Move your opponent's active Hermit to a new slot.",
				canPick: pickCondition,
				onResult(pickedSlot) {
					if (!pickedSlot.inRow()) return
					if (opponentPlayer.activeRow === null) return

					game.swapRows(opponentPlayer.activeRow, pickedSlot.row)
				},
				onTimeout() {
					if (opponentPlayer.activeRow === null) return

					const emptyOpponentRow = game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.not(query.row.active),
						query.not(query.row.hasHermit),
					)

					if (!emptyOpponentRow) return

					game.swapRows(opponentPlayer.activeRow, emptyOpponentRow)
				},
			})
		})
	}
}

export default LDShadowLadyRare
