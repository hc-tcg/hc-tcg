import {CardComponent, DeckSlotComponent} from '../../components'
import {GameModel} from '../../models/game-model'
import CardOld from '../../base/card'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'
import FletchingTable from './fletching-table'

class Dropper extends CardOld {
	props: SingleUse = {
		...singleUse,
		id: 'dropper',
		numericId: 222,
		name: 'Dropper',
		expansion: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 0,
		description: "Shuffle 2 fletching tables into your opponent's deck",
		showConfirmationModal: true,
	}

	override onAttach(game: GameModel, component: CardComponent): void {
		const {player} = component

		player.hooks.onApply.add(component, () => {
			for (let i = 0; i < 2; i++) {
				let slot = game.components.new(DeckSlotComponent, player.entity, {
					position: 'random',
				})
				game.components.new(CardComponent, FletchingTable, slot.entity)
			}
		})
	}

	public override onDetach(_game: GameModel, component: CardComponent): void {
		const {player} = component

		player.hooks.onApply.remove(component)
	}
}

export default Dropper
