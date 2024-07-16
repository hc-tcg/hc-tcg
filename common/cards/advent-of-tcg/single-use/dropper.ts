import {GameModel} from '../../../models/game-model'
import {CardComponent, DeckSlotComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import FletchingTableSingleUseCard from './fletching-table'

class DropperSingleUseCard extends Card {
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
		const {player, opponentPlayer} = component

		player.hooks.onApply.add(component, () => {
			for (let i = 0; i < 2; i++) {
				let slot = game.components.new(DeckSlotComponent, player.entity, {position: 'random'})
				game.components.new(CardComponent, FletchingTableSingleUseCard, slot.entity)
			}
		})
	}

	public override onDetach(game: GameModel, component: CardComponent): void {
		const {player} = component

		player.hooks.onApply.remove(component)
	}
}

export default DropperSingleUseCard
