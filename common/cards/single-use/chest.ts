import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {applySingleUse} from '../../utils/board'
import {discardSingleUse, retrieveCard} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

class ChestSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'chest',
			numericId: 4,
			name: 'Chest',
			rarity: 'rare',
			description:
				'Look through your discard pile and select 1 card to return to your hand.\n\nCan not return "Clock" to your hand.',
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		const {player} = pos
		// Cannot play chest with no items in discard
		if (player.discarded.length <= 0) return 'NO'

		return 'YES'
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addModalRequest({
			playerId: player.id,
			data: {modalId: this.id},
			onResult(modalResult) {
				if (!modalResult) return 'FAILURE_INVALID_DATA'

				if (!modalResult.card) {
					discardSingleUse(game, player)
					return 'SUCCESS'
				}

				if (modalResult.card.cardId === 'clock') {
					return 'FAILURE_CANNOT_COMPLETE'
				}

				applySingleUse(game)
				retrieveCard(game, modalResult.card)

				return 'SUCCESS'
			},
			onTimeout() {
				// Do nothing
			},
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default ChestSingleUseCard
