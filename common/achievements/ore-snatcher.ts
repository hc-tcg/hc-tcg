import {
	DiamondArmor,
	GoldArmor,
	IronArmor,
	NetheriteArmor,
} from '../cards/attach/armor'
import Emerald from '../cards/single-use/emerald'
import {SlotComponent} from '../components'
import query from '../components/query'
import {afterApply} from '../types/priorities'
import {achievement} from './defaults'
import {Achievement} from './types'

const Armor = [GoldArmor, IronArmor, DiamondArmor, NetheriteArmor].map(
	(card) => card.id,
)

const OreSnatcher: Achievement = {
	...achievement,
	numericId: 13,
	id: 'ore_snatcher',
	progressionMethod: 'sum',
	levels: [
		{
			name: 'Ore Snatcher',
			description:
				"Use emerald to steal your opponent's gold, iron, diamond, or netherite armor 10 times.",
			steps: 10,
		},
	],
	onGameStart(game, player, component, observer) {
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
				if (!Armor.includes(player.activeRow?.getAttach()?.props.id || ''))
					return

				component.updateGoalProgress({goal: 0})
			},
		)
	},
}

export default OreSnatcher
