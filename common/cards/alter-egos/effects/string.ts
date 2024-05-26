import {CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {TurnActions} from '../../../types/game-state'
import {CanAttachResult} from '../../base/card'
import EffectCard from '../../base/effect-card'

class StringEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'string',
			numericId: 122,
			name: 'String',
			rarity: 'rare',
			description:
				"Attach to one of your opponent's empty item or effect slots.\n\nYour opponent can no longer attach cards to that slot.",
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const {opponentPlayer} = game

		const result: CanAttachResult = []

		// attach to effect or item slot
		if (pos.slot.type !== 'effect' && pos.slot.type !== 'item') result.push('INVALID_SLOT')

		// can only attach to opponent
		if (pos.player.id !== opponentPlayer.id) result.push('INVALID_PLAYER')

		if (!pos.row?.hermitCard) result.push('UNMET_CONDITION_SILENT')

		return result
	}

	// This card allows placing on either effect or item slot
	public override getActions(game: GameModel): TurnActions {
		const {opponentPlayer} = game

		// Is there is a hermit on the opponent's board with space for an item card
		const spaceForItem = opponentPlayer.board.rows.some((row) => {
			const hasHermit = !!row.hermitCard
			const hasEmptyItemSlot = row.itemCards.some((card) => card === null)
			return hasHermit && hasEmptyItemSlot
		})
		// Is there is a hermit on the opponent's board with space for an effect card
		const spaceForEffect = opponentPlayer.board.rows.some((row) => {
			return !!row.hermitCard && !row.effectCard
		})

		const actions: TurnActions = []
		if (spaceForItem) {
			actions.push('PLAY_ITEM_CARD')
			// If an item card was already played allow String to be placed in opponent's item slot
			// TODO: If a future card allows playing multiple items in a turn, this will cause conflicts
			if (
				game.state.turn.completedActions.includes('PLAY_ITEM_CARD') &&
				!game.isActionBlocked('PLAY_ITEM_CARD')
			) {
				game.removeCompletedActions('PLAY_ITEM_CARD')
				const placementKey = this.getKey('allowPlacement')
				const hooks = game.currentPlayer.hooks
				// Prevent placing a second item card from hand on the current player's board
				hooks.canAttach.add(placementKey, (canAttach, pos) => {
					if (pos.slot.type !== 'item' || pos.player.id !== game.currentPlayer.id) return
					// 'INVALID_PLAYER' prevents placement from hand but not movement by Piston
					if (!canAttach.includes('INVALID_PLAYER')) canAttach.push('INVALID_PLAYER')
				})
				// Clean up hooks after game state changes
				hooks.onAttach.add(placementKey, () => {
					game.addCompletedActions('PLAY_ITEM_CARD')
					hooks.canAttach.remove(placementKey)
					hooks.onAttach.remove(placementKey)
					hooks.onTurnEnd.remove(placementKey)
				})
				hooks.onTurnEnd.add(placementKey, () => {
					// Do not re-add completed actions when turn is ending
					hooks.canAttach.remove(placementKey)
					hooks.onAttach.remove(placementKey)
					hooks.onTurnEnd.remove(placementKey)
				})
			}
		}
		if (spaceForEffect) actions.push('PLAY_EFFECT_CARD')
		return actions
	}

	override getExpansion() {
		return 'alter_egos'
	}
}

export default StringEffectCard
