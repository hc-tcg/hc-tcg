import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRow} from '../../../utils/board'
import {CanAttachResult} from '../../base/card'
import SingleUseCard from '../../base/single-use-card'
import {applyStatusEffect} from '../../../utils/board'
import {hasActive} from '../../../utils/game'

class PotionOfWeaknessSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'potion_of_weakness',
			numericId: 146,
			name: 'Potion of Weakness',
			rarity: 'common',
			description:
				"Your opponent's active Hermit is weak to your active Hermit's type for 3 turns.",
		})
	}

	override canApply() {
		return true
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result: CanAttachResult = []
		if (pos.slot.type !== 'single_use') result.push('INVALID_SLOT')

		if (!hasActive(pos.opponentPlayer)) result.push('UNMET_CONDITION')

		return result
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, () => {
			const opponentActiveRow = getActiveRow(opponentPlayer)
			if (!opponentActiveRow) return
			applyStatusEffect(game, 'weakness', opponentActiveRow.hermitCard?.cardInstance)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
	override getExpansion() {
		return 'alter_egos'
	}

	override sidebarDescriptions() {
		return [
			{
				type: 'glossary',
				name: 'weak',
			},
		]
	}
}

export default PotionOfWeaknessSingleUseCard
