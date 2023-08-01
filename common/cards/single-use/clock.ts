import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {AvailableActionsT} from '../../types/game-state'
import SingleUseCard from '../base/single-use-card'

class ClockSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'clock',
			name: 'Clock',
			rarity: 'ultra_rare',
			description:
				'Your opponent skips their next turn.\n\nThey still draw a card and they may choose to make their active Hermit go AFK.',
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			// Block all actions except for "CHANGE_ACTIVE_HERMIT" and all the wait and followup actions
			opponentPlayer.hooks.blockedActions.add(instance, (blockedActions) => {
				const blocked: AvailableActionsT = [
					'APPLY_EFFECT',
					'REMOVE_EFFECT',
					'ZERO_ATTACK',
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'ADD_HERMIT',
					'PLAY_ITEM_CARD',
					'PLAY_SINGLE_USE_CARD',
					'PLAY_EFFECT_CARD',
				]

				blockedActions.push(...blocked)
				return blockedActions
			})

			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				opponentPlayer.hooks.blockedActions.remove(instance)
				opponentPlayer.hooks.onTurnEnd.remove(instance)
			})
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		if (super.canAttach(game, pos) === 'INVALID') return 'INVALID'
		// The other player wouldn't be able to attach anything
		if (game.state.turn === 1) return 'NO'
		return 'YES'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default ClockSingleUseCard
