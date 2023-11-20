import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {getActiveRow} from '../../utils/board'
import SingleUseCard from '../base/single-use-card'
import {applyAilment} from '../../utils/board'

class PotionOfSlownessSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'potion_of_slowness',
			numericId: 145,
			name: 'Potion of Slowness',
			rarity: 'common',
			description: "Opponent's active Hermit can only use their primary attack on their next turn.",
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
			applyAilment(game, 'slowness', opponentActiveRow.hermitCard?.cardInstance)
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
