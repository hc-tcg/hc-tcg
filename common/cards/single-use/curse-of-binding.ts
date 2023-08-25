import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import SingleUseCard from '../base/single-use-card'

class CurseOfBindingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'curse_of_binding',
			numeric_id: 11,
			name: 'Curse Of Binding',
			rarity: 'common',
			description: "Your opponent's active Hermit can not go AFK on their next turn.",
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			opponentPlayer.hooks.blockedActions.add(instance, (blockedActions) => {
				if (blockedActions.includes('CHANGE_ACTIVE_HERMIT')) {
					return blockedActions
				}

				// Make sure the other player has an active row
				if (opponentPlayer.board.activeRow !== null) {
					blockedActions.push('CHANGE_ACTIVE_HERMIT')
				}

				return blockedActions
			})

			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				// Remove effects of card and clean up
				opponentPlayer.hooks.blockedActions.remove(instance)
				opponentPlayer.hooks.onTurnEnd.remove(instance)
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.remove(instance)
	}
}

export default CurseOfBindingSingleUseCard
