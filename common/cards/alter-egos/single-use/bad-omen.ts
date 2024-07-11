import {GameModel} from '../../../models/game-model'
import Card, {SingleUse, singleUse} from '../../base/card'
import {CardComponent, StatusEffectComponent} from '../../../types/components'
import {card, row, slot} from '../../../filters'

class BadOmenSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'bad_omen',
		numericId: 139,
		name: 'Bad Omen',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		description: `Give your opponent's active Hermit bad omen for their next 3 turns.`,
		showConfirmationModal: true,
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'badomen',
			},
		],
		attachCondition: slot.every(singleUse.attachCondition, slot.opponentHasActiveHermit),
	}

	override onAttach(game: GameModel, instance: CardComponent) {
		const {player} = instance

		player.hooks.onApply.add(instance, () => {
			let target = game.state.cards.findEntity(card.hermit, card.rowFulfills(row.active))
			if (!target) return
			let effect = game.state.statusEffects.new(StatusEffectComponent, player.id, 'badomen')
			effect.target = game.state.cards.findEntity(card.hermit, card.rowFulfills(row.active))
		})
	}

	override onDetach(game: GameModel, instance: CardComponent) {
		const {player} = instance
		player.hooks.onApply.remove(instance)
	}
}

export default BadOmenSingleUseCard
