import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRow} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'
import {applyStatusEffect} from '../../../utils/board'

class PotionOfWeaknessSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'potion_of_weakness',
			numericId: 146,
			name: 'Potion of Weakness',
			rarity: 'common',
			description:
				"Your opponent's active Hermit type is weak to your active Hermit's type for 3 turns.",
		})
	}

	override canApply() {
		return true
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		if (pos.slot.type !== 'single_use') return 'INVALID'

		if (pos.opponentPlayer.board.activeRow === null) return 'NO'

		return 'YES'
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
				type: 'overt',
				name: 'Weak',
				description:
					"Hermits take 20hp extra damage if they are weak to the Hermit they were attacked by, provided the attack doesn't miss.",
			},
		]
	}
}

export default PotionOfWeaknessSingleUseCard
