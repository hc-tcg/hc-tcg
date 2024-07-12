import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {TurnActions} from '../../../types/game-state'
import {applyStatusEffect} from '../../../utils/board'
import Card, {SingleUse} from '../../base/card'
import {CardComponent} from '../../../components/components'
import singleUse from '.'

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

	override onAttach(game: GameModel, component: CardComponent) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(component, () => {
			opponentPlayer.hooks.onTurnStart.add(component, () => {
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
				opponentPlayer.hooks.onTurnStart.remove(component)
			})

			applyStatusEffect(game, 'used-clock', getActiveRow(opponentPlayer)?.hermitCard)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.onApply.remove(component)
	}
}

export default ClockSingleUseCard
