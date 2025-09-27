import Emerald from '../cards/single-use/emerald'
import {SlotComponent} from '../components'
import query from '../components/query'
import { CardEntity } from '../entities'
import { afterApply } from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const DoubleEmerald: Achievement = {
	...achievement,
	numericId: 59,
	id: 'double-emerald',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'I Needed That',
			description: "Use emerald to attach an effect to your opponent's Hermit, and then steal it back.",
			steps: 1,
		},
	],
	onGameStart(game, player, component, observer) {
        const sentCards: Set<CardEntity> = new Set()

        observer.subscribeWithPriority(
			player.hooks.afterApply,
			afterApply.CHECK_BOARD_STATE,
			() => {
				const SUSlot = game.components.find(
					SlotComponent,
					query.slot.singleUse,
					query.slot.player(player.entity),
				)
				if (!SUSlot) return
				if (SUSlot.card?.props !== Emerald) return
                const sending = player.activeRow?.getAttach()
				if (!sending) return
                sentCards.add(sending.entity)
			},
		)

        observer.subscribe(player.hooks.onAttach, (card) => {
            if (!sentCards.has(card.entity)) return

            component.updateGoalProgress({goal: 0})
        })
	},
}

export default DoubleEmerald
