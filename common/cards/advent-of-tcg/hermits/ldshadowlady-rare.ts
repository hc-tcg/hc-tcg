import CardOld from '../../base/card'
import {CardComponent} from '../../components'
import {slot} from '../../components/query'
import {GameModel} from '../../models/game-model'
import {hermit} from '../defaults'
import {Hermit} from '../types'

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
		_observer: Observer,
	) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(component, (attack) => {
			if (
				attack.id !== this.getInstanceKey(component) ||
				attack.type !== 'secondary' ||
				!attack.getTarget()
			)
				return

			if (
				!game.someSlotFulfills(
					slot.every(slot.opponent, slot.hermit, slot.active),
				)
			)
				return

			const pickCondition = slot.every(
				slot.empty,
				slot.hermit,
				slot.opponent,
				slot.not(slot.active),
			)

			if (!game.someSlotFulfills(pickCondition)) return

			game.addPickRequest({
				player: player.entity,
				id: this.props.id,
				message: "Move your opponent's active Hermit to a new slot.",
				canPick: pickCondition,
				onResult(pickedSlot) {
					if (pickedSlot.rowIndex === null) return
					if (opponentPlayer.board.activeRow === null) return

					game.swapRows(
						opponentPlayer,
						opponentPlayer.board.activeRow,
						pickedSlot.rowIndex,
					)
				},
				onTimeout() {
					if (opponentPlayer.board.activeRow === null) return

					const emptyHermitSlots = game.filterSlots(pickCondition)

					const pickedRowIndex =
						emptyHermitSlots[
							Math.floor(Math.random() * emptyHermitSlots.length)
						].rowIndex

					if (!pickedRowIndex) return

					game.swapRows(
						opponentPlayer,
						opponentPlayer.board.activeRow,
						pickedRowIndex,
					)
				},
			})
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.afterAttack.remove(component)
	}
}

export default LDShadowLadyRare
