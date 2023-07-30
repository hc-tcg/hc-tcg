import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {getActiveRow} from '../../utils/board'
import SingleUseCard from '../base/single-use-card'

class PotionOfWeaknessSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'potion_of_weakness',
			name: 'Potion of Weakness',
			rarity: 'common',
			description:
				"Opponent's active Hermit type is now weak to your active Hermit's type for 3 turns.",
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const opponentActiveRow = getActiveRow(opponentPlayer)
			if (!opponentActiveRow) return
			opponentActiveRow.ailments.push({id: 'weakness', duration: 3})
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
