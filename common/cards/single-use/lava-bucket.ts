import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import SingleUseCard from '../base/single-use-card'

class LavaBucketSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'lava_bucket',
			numeric_id: 74,
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
		const {player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			const opponentActiveRow = pos.opponentPlayer.board.activeRow
			if (opponentActiveRow === null) return

			const hasDamageEffect = pos.opponentPlayer.board.rows[opponentActiveRow].ailments.some(
				(ailment) => {
					return ailment.id === 'fire' || ailment.id === 'poison'
				}
			)
			if (!hasDamageEffect) {
				pos.opponentPlayer.board.rows[opponentActiveRow].ailments.push({
					id: 'fire',
				})
			}
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
