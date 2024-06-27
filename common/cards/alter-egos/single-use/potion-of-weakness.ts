import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRow} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'
import {applyStatusEffect} from '../../../utils/board'
import {slot} from '../../../slot'

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

	override _attachCondition = slot.every(super.attachCondition, slot.opponentHasActiveHermit)

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, () => {
			const opponentActiveRow = getActiveRow(opponentPlayer)
			if (!opponentActiveRow) return
			applyStatusEffect(game, 'weakness', opponentActiveRow.hermitCard?.instance)
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
