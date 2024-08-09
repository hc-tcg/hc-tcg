import {CardComponent} from '../../../components'
import {slot} from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class Smajor1995Rare extends CardOld {
	props: Hermit = {
		...hermit,
		id: 'smajor1995_rare',
		numericId: 218,
		name: 'Scott',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 0,
		type: 'builder',
		health: 270,
		primary: {
			name: 'Color Splash',
			cost: ['any'],
			damage: 30,
			power: null,
		},
		secondary: {
			name: 'To Dye For',
			cost: ['any', 'any', 'any'],
			damage: 70,
			power:
				'After your attack, select one of your Hermits. Items attached to this Hermit become any type.',
		},
	}

	public override onAttach(game: GameModel, component: CardComponent): void {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			if (
				attack.id !== this.getInstanceKey(component) ||
				attack.type !== 'secondary'
			)
				return

			const pickCondition = slot.every(
				slot.player,
				slot.not(slot.active),
				slot.not(slot.empty),
				slot.hermit,
			)

			if (!game.someSlotFulfills(pickCondition)) return

			game.addPickRequest({
				player: player.entity,
				id: component.entity,
				message: 'Choose an AFK Hermit to dye.',
				canPick: pickCondition,
				onResult(pickedSlot) {
					const rowIndex = pickedSlot.rowIndex
					if (!pickedSlot.cardId || rowIndex === null) return

					applyStatusEffect(game, 'dyed', pickedSlot.cardId)
				},
			})
		})
	}

	public override onDetach(_game: GameModel, component: CardComponent): void {
		const {player} = component
		player.hooks.onAttack.remove(component)
	}
}

export default Smajor1995Rare
