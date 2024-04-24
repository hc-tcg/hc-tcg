import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applyStatusEffect} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class LavaBucketSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'lava_bucket',
			numericId: 74,
			name: 'Lava Bucket',
			rarity: 'rare',
			description: "Burn your opponent's active Hermit.",
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, () => {
			const opponentActiveRow = opponentPlayer.board.activeRow
			if (opponentActiveRow === null) return
			applyStatusEffect(
				game,
				'fire',
				opponentPlayer.board.rows[opponentActiveRow].hermitCard?.cardInstance
			)
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

	override sidebarDescriptions() {
		return [
			{
				type: 'statusEffect',
				name: 'fire',
			},
		]
	}
}

export default LavaBucketSingleUseCard
