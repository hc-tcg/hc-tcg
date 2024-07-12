import {GameModel} from '../../../models/game-model'
import {applyStatusEffect} from '../../../utils/board'
import {slot} from '../../../components/query'
import Card, {Hermit, hermit} from '../../base/card'
import {CardComponent} from '../../../types/game-state'

class Smajor1995RareHermitCard extends Card {
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
		const {player} = pos

		player.hooks.onAttack.add(component, (attack) => {
			if (attack.id !== this.getInstanceKey(component) || attack.type !== 'secondary') return

			const pickCondition = slot.every(
				slot.player,
				slot.not(slot.activeRow),
				slot.not(slot.empty),
				slot.hermitSlot
			)

			if (!game.someSlotFulfills(pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
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

	public override onDetach(game: GameModel, component: CardComponent): void {
		const {player} = pos
		player.hooks.onAttack.remove(component)
	}
}

export default Smajor1995RareHermitCard
