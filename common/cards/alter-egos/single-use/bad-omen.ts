import {GameModel} from '../../../models/game-model'
import Card, {SingleUse, singleUse} from '../../base/card'
import {CardComponent, StatusEffectComponent} from '../../../components'
import {card, row, slot} from '../../../components/query'

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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onApply.add(component, () => {
			let target = game.components.findEntity(CardComponent, card.isHermit, card.row(row.active))
			if (!target) return
			let effect = game.components.new(StatusEffectComponent, player.entity, 'badomen')
			effect.target = game.components.findEntity(CardComponent, card.isHermit, card.row(row.active))
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default BadOmenSingleUseCard
