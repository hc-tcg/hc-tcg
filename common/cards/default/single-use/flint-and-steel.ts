import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {discardFromHand, drawCards} from '../../../utils/movement'
import SingleUseCard from '../../base/single-use-card'

class FlintAndSteelSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'flint_&_steel',
			numericId: 25,
			name: 'Flint & Steel',
			rarity: 'common',
			description:
				'Discard your hand. Draw 3 cards.\nCan be used even if you do not have any cards in your hand.',
			log: (values) => `${values.defaultLog} to discard {your|their} hand and draw 3 cards`,
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)
		const {player} = pos

		if (player.pile.length <= 3) result.push('UNMET_CONDITION')

		return result
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, () => {
			const hand = player.hand
			for (const card of hand) {
				discardFromHand(player, card)
			}

			drawCards(player, 3)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default FlintAndSteelSingleUseCard
