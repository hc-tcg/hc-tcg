import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {CardComponent, TurnActions} from '../../../types/game-state'
import {applyStatusEffect} from '../../../utils/board'
import Card, {SingleUse, singleUse} from '../../base/card'

class ClockSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'clock',
		numericId: 6,
		name: 'Clock',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 4,
		description:
			'Your opponent skips their next turn.\nThis card can not be returned to your hand from your discard pile.',
		showConfirmationModal: true,
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'turnSkip',
			},
		],
		attachCondition: slot.every(
			singleUse.attachCondition,
			slot.not(slot.someSlotFulfills(slot.hasStatusEffect('used-clock'))),
			(game, pos) => game.state.turn.turnNumber !== 1
		),
		log: (values) => `${values.defaultLog} and skipped {$o${values.opponent}'s$|your} turn`,
	}

	override onAttach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, () => {
			opponentPlayer.hooks.onTurnStart.add(instance, () => {
				game.addBlockedActions(
					this.props.id,
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

			applyStatusEffect(game, 'used-clock', getActiveRow(opponentPlayer)?.hermitCard)
		})
	}

	override onDetach(game: GameModel, instance: CardComponent, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default ClockSingleUseCard
