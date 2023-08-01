import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {retrieveCard} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

class ChestSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'chest',
			name: 'Chest',
			rarity: 'rare',
			description:
				'Look through your discard pile and select 1 card to return to your hand.\n\nCan not return "Clock" to your hand.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			/** @type {import('../../types/game-state').CardT | undefined} */
			const card: import('../../types/game-state').CardT | undefined = modalResult.card
			if (!card || card.cardId === 'clock') return

			retrieveCard(game, card)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default ChestSingleUseCard
