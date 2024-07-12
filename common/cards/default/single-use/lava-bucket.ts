import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {CardComponent} from '../../../types/game-state'
import {applyStatusEffect} from '../../../utils/board'
import Card, {SingleUse} from '../../base/card'
import {singleUse} from '../../base/defaults'

class LavaBucketSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'lava_bucket',
		numericId: 74,
		name: 'Lava Bucket',
		expansion: 'default',
		rarity: 'rare',
		tokens: 3,
		description: "Burn your opponent's active Hermit.",
		showConfirmationModal: true,
		attachCondition: slot.every(singleUse.attachCondition, slot.opponentHasActiveHermit),
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'fire',
			},
		],
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(component, () => {
			const opponentActiveRow = opponentPlayer.board.activeRow
			if (opponentActiveRow === null) return
			applyStatusEffect(game, 'fire', opponentPlayer.board.rows[opponentActiveRow].hermitCard)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onApply.remove(component)
	}
}

export default LavaBucketSingleUseCard
