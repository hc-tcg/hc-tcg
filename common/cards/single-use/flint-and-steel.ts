import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {discardFromHand, drawCards} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

class FlintAndSteelSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'flint_&_steel',
			name: 'Flint & Steel',
			rarity: 'common',
			description:
				'Discard your hand. Draw 3 cards.\n\nCan be used even if you do not have any cards in your hand.',
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		const {player} = pos
		if (player.pile.length <= 3) return 'NO'

		return 'YES'
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			for (const card of player.hand) {
				discardFromHand(player, card)
			}

			drawCards(player, 3)
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('types/cards').BasicCardPos} pos
	 */
	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default FlintAndSteelSingleUseCard
