import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import SingleUseCard from '../base/single-use-card'

class DropperSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'dropper',
			numericId: 152,
			name: 'Dropper',
			rarity: 'rare',
			description:
				"Shuffle 3 useless blocks that will at some point have functionality into your opponent's deck",
		})
	}

	public override canApply(): boolean {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos

		player.hooks.onApply.add(instance, () => {
			const cardInfo = {
				cardId: '',
				cardInstance: Math.random().toString(),
			}
			player.pile.unshift(cardInfo)
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
