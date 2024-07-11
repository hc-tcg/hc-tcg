import {GameModel} from '../../../models/game-model'
import {card, slot} from '../../../filters'
import {CardComponent} from '../../../types/game-state'
import {drawCards} from '../../../utils/movement'
import Card, {SingleUse, singleUse} from '../../base/card'

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
		attachCondition: slot.every(
			singleUse.attachCondition,
			(game, pos) =>
				game.state.cards.filterEntities(card.slotFulfills(slot.currentPlayer, slot.pile)).length > 2
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = pos

		player.hooks.onApply.add(component, () => {
			drawCards(player, 2)
			player.hooks.onApply.remove(component)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onApply.remove(component)
	}
}

export default FishingRodSingleUseCard
