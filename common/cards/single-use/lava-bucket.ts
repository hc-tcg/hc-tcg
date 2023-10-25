import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import { applyAilment } from '../../utils/board'
import Fire from '../../ailments/fire'
import SingleUseCard from '../base/single-use-card'

class LavaBucketSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'lava_bucket',
			numericId: 74,
			name: 'Lava Bucket',
			rarity: 'rare',
			description:
				'Burn opposing active Hermit. Add 20hp damage every turn at the end of your turn.',
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, (pickedSlots) => {
			const opponentActiveRow = opponentPlayer.board.activeRow
			if (opponentActiveRow === null) return
			applyAilment(game, 'fire', opponentPlayer.board.rows[opponentActiveRow].hermitCard?.cardInstance)
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		if (pos.slot.type !== 'single_use') return 'INVALID'

		if (pos.opponentPlayer.board.activeRow === null) return 'NO'

		return 'YES'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default LavaBucketSingleUseCard
