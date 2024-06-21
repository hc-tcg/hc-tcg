import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRow} from '../../../utils/board'
import {isRemovable} from '../../../utils/cards'
import {discardCard} from '../../../utils/movement'
import SingleUseCard from '../../base/single-use-card'

class CurseOfVanishingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'curse_of_vanishing',
			numericId: 12,
			name: 'Curse Of Vanishing',
			rarity: 'common',
			description: 'Your opponent must discard any effect card attached to their active Hermit.',
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, () => {
			if (opponentPlayer.board.activeRow === null) return
			const opponentActiveRow = opponentPlayer.board.rows[opponentPlayer.board.activeRow]
			if (opponentActiveRow.effectCard && isRemovable(opponentActiveRow.effectCard)) {
				discardCard(game, opponentActiveRow.effectCard)
			}
		})
	}

	override canApply() {
		return true
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)

		const {opponentPlayer} = pos

		const opponentActiveRow = getActiveRow(opponentPlayer)
		if (
			!opponentActiveRow ||
			!opponentActiveRow.effectCard ||
			!isRemovable(opponentActiveRow.effectCard)
		) {
			result.push('UNMET_CONDITION')
		}

		return result
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default CurseOfVanishingSingleUseCard
