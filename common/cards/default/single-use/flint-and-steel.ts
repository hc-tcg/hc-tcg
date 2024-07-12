import {GameModel} from '../../../models/game-model'
import {card, query, slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import {discardFromHand, drawCards} from '../../../utils/movement'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class FlintAndSteelSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'flint_&_steel',
		numericId: 25,
		name: 'Flint & Steel',
		expansion: 'default',
		rarity: 'common',
		tokens: 1,
		description:
			'Discard your hand. Draw 3 cards.\nCan be used even if you do not have any cards in your hand.',
		showConfirmationModal: true,
		log: (values) => `${values.defaultLog} to discard {your|their} hand and draw 3 cards`,
		attachCondition: query.every(
			singleUse.attachCondition,
			(game, pos) =>
				// What should player be here?
				game.state.cards.filterEntities(
					card.player(game.currentPlayer.entity),
					card.slot(slot.discardPile)
				).length > 3
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onApply.add(component, () => {
			const hand = player.hand
			for (const card of hand) {
				discardFromHand(player, card)
			}

			drawCards(player, 3)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default FlintAndSteelSingleUseCard
