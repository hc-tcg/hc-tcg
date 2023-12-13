import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import SingleUseCard from '../../base/single-use-card'

class DropperSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'dropper',
			numericId: 222,
			name: 'Dropper',
			rarity: 'rare',
			description: "Shuffle 3 fletching tables into your opponent's deck",
		})
	}

	public override canApply(): boolean {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, () => {
			for (let i = 0; i < 3; i++) {
				const cardInfo = {
					cardId: 'fletching_table',
					cardInstance: Math.random().toString(),
				}
				opponentPlayer.pile.splice(
					Math.round(Math.random() * opponentPlayer.pile.length),
					0,
					cardInfo
				)
			}
		})
	}

	public override onDetach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos

		player.hooks.onApply.remove(instance)
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}
}

export default DropperSingleUseCard
