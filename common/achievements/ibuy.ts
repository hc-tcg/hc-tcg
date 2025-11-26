import Chest from '../cards/single-use/chest'
import {SlotComponent} from '../components'
import query from '../components/query'
import {afterApply, onTurnEnd} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const iBuy: Achievement = {
	...achievement,
	numericId: 50,
	id: 'ibuy',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'iBuy',
			description:
				'Use Chest to draw a card from your discard pile, and then draw a different copy of that card at the end of your turn.',
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
		let playerHand: Array<string> = []
		let newCardId: string | null = null

		observer.subscribe(player.hooks.onAttach, (slot) => {
			if (!slot.isSingleUse()) return
			playerHand = player.getHand().map((card) => card.props.id)
		})

		observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CHECK_BOARD_STATE,
			() => {
				const su = game.components.find(
					SlotComponent,
					query.slot.singleUse,
				)?.card
				if (!su) return
				if (su.props.id !== Chest.id) return

				const newPlayerHand = player.getHand().map((card) => card.props.id)

				for (const card of playerHand) {
					let index = newPlayerHand.indexOf(card)
					if (index >= 0) return
					newCardId = card
				}
			},
		)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.BOARD_STATE,
			(drawCards) => {
				if (drawCards.find((card) => card?.props.id === newCardId)) {
					component.updateGoalProgress({goal: 0})
				}
				newCardId = null
			},
		)
	},
}

export default iBuy
