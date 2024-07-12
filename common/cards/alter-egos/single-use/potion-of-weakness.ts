import {GameModel} from '../../../models/game-model'
import {applyStatusEffect} from '../../../utils/board'
import {slot} from '../../../components/query'
import Card, {SingleUse, singleUse} from '../../base/card'
import {CardComponent} from '../../../types/game-state'

class PotionOfWeaknessSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'potion_of_weakness',
		numericId: 146,
		name: 'Potion of Weakness',
		expansion: 'alter_egos',
		rarity: 'common',
		tokens: 2,
		description: "Your opponent's active Hermit is weak to your active Hermit's type for 3 turns.",
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'weak',
			},
		],
		showConfirmationModal: true,
		attachCondition: slot.every(singleUse.attachCondition, slot.opponentHasActiveHermit),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(component, () => {
			const opponentActiveRow = getActiveRow(opponentPlayer)
			if (!opponentActiveRow) return
			applyStatusEffect(game, 'weakness', opponentActiveRow.hermitCard)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onApply.remove(component)
	}
}

export default PotionOfWeaknessSingleUseCard
