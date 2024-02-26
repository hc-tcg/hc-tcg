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
				"Opponent's active Hermit type is now weak to your active Hermit's type for 3 turns.",
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
}

export default PotionOfWeaknessSingleUseCard
