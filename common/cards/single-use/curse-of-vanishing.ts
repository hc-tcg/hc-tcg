import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {isRemovable} from '../../utils/cards'
import {discardCard} from '../../utils/movement'
import SingleUseCard from '../base/single-use-card'

class CurseOfVanishingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'curse_of_vanishing',
			numeric_id: 12,
			name: 'Curse Of Vanishing',
			rarity: 'common',
			description: "Your opponent is forced to discard their active Hermit's attached effect card.",
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
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
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach
		
		const {opponentPlayer} = pos

		if (opponentPlayer.board.activeRow === null) return 'NO'
		const opponentActiveRow = opponentPlayer.board.rows[opponentPlayer.board.activeRow]
		if (!opponentActiveRow.effectCard || !isRemovable(opponentActiveRow.effectCard)) return 'NO'

		return 'YES'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default CurseOfVanishingSingleUseCard
