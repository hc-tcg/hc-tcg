import {GameModel} from '../../../models/game-model'
import {card, query, slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class FishingRodSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'fishing_rod',
		numericId: 24,
		name: 'Fishing Rod',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 2,
		description: 'Draw 2 cards.',
		showConfirmationModal: true,
		log: (values) => `${values.defaultLog} to draw 2 cards`,
		attachCondition: query.every(
			singleUse.attachCondition,
			(game, pos) =>
				game.components.filter(CardComponent, card.slot(slot.currentPlayer, slot.deck)).length > 2
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onApply.add(component, () => {
			drawCards(player, 2)
			player.hooks.onApply.remove(component)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default FishingRodSingleUseCard
