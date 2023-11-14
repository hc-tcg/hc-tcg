import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import { CardT } from '../../types/game-state'
import SingleUseCard from '../base/single-use-card'

class LanternSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'lantern',
			numericId: 169,
			name: 'Lantern',
			rarity: 'rare',
			description:
				"Look at the top 5 cards of your deck, and choose 2 to draw. Show these 2 cards to your opponent.",
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, () => {
			game.addModalRequest({
				playerId: player.id,
				data: {modalId: 'selectCards', payload: {
					modalName: "Choose cards to draw.",
					modalDescription: "",
					cards: player.pile.slice(0,5),
					selectionSize: 2
				}},
				onResult(modalResult) {
					if (!modalResult) return 'FAILURE_INVALID_DATA'

					const cards: Array<CardT> = modalResult.cards

					player.pile.filter((c) => !cards.includes(c))
					cards.reverse().map((c) => player.hand.push(c))

					return 'SUCCESS'
				},
				onTimeout() {},
			})
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach
		const {player} = pos

		// Cannot use if you have 3 or less cards
		if (player.playerDeck.length < 5) return 'NO'

		return 'YES'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}
}

export default LanternSingleUseCard
