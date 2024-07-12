import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card, {SingleUse, singleUse} from '../../base/card'

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
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(component, () => {
			for (let i = 0; i < 2; i++) {
				opponentPlayer.pile.splice(
					Math.round(Math.random() * opponentPlayer.pile.length),
					0,
					CardComponent.fromCardId('fletching_table')
				)
			}
		})
	}

	public override onDetach(game: GameModel, component: CardComponent): void {
		const {player} = pos

		player.hooks.onApply.remove(component)
	}
}

export default DropperSingleUseCard
