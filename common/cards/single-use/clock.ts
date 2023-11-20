import {CardPosModel} from '../../models/card-pos-model'
import {GameModel} from '../../models/game-model'
import {TurnActions} from '../../types/game-state'
import SingleUseCard from '../base/single-use-card'

class ClockSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'clock',
			numericId: 6,
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

		player.hooks.onApply.add(instance, () => {
			opponentPlayer.hooks.onTurnStart.add(instance, () => {
				game.addBlockedActions(
					'APPLY_EFFECT',
					'REMOVE_EFFECT',
					'SINGLE_USE_ATTACK',
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'PLAY_HERMIT_CARD',
					'PLAY_ITEM_CARD',
					'PLAY_SINGLE_USE_CARD',
					'PLAY_EFFECT_CARD'
				)
				opponentPlayer.hooks.onTurnStart.remove(instance)
			})
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)
		if (canAttach !== 'YES') return canAttach

		// The other player wouldn't be able to attach anything
		if (game.state.turn.turnNumber === 1) return 'NO'
		return 'YES'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default ClockSingleUseCard
