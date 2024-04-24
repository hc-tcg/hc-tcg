import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRow} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'
import {applyStatusEffect} from '../../../utils/board'

class PotionOfSlownessSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'potion_of_slowness',
			numericId: 145,
			name: 'Potion of Slowness',
			rarity: 'common',
			description:
				"Your opponent's active Hermit's can only use their primary attack on their next turn.",
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, () => {
			const opponentActiveRow = getActiveRow(opponentPlayer)
			if (!opponentActiveRow) return
			applyStatusEffect(game, 'slowness', opponentActiveRow.hermitCard?.cardInstance)
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

export default PotionOfSlownessSingleUseCard
