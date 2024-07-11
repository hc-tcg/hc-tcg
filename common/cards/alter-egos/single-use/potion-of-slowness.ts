import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../types/game-state'
import {applyStatusEffect} from '../../../utils/board'
import Card, {SingleUse, singleUse} from '../../base/card'

class PotionOfSlownessSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'potion_of_slowness',
		numericId: 145,
		name: 'Potion of Slowness',
		expansion: 'alter_egos',
		rarity: 'common',
		tokens: 2,
		description:
			"Your opponent's active Hermit can only use their primary attack on their next turn.",
		showConfirmationModal: true,
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(component, () => {
			const opponentActiveRow = getActiveRow(opponentPlayer)
			if (!opponentActiveRow) return
			applyStatusEffect(game, 'slowness', opponentActiveRow.hermitCard)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onApply.remove(component)
	}
}

export default PotionOfSlownessSingleUseCard
