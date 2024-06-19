import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
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

	override _attachCondition = slot.every(slot.singleUseSlot, slot.opponentHasActiveHermit)

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
