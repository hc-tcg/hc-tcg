import {
	DiamondArmor,
	GoldArmor,
	IronArmor,
	NetheriteArmor,
} from '../cards/attach/armor'
import Emerald from '../cards/single-use/emerald'
import {SlotComponent} from '../components'
import query from '../components/query'
import {achievement} from './defaults'
import {Achievement} from './types'

const Armor = [GoldArmor, IronArmor, DiamondArmor, NetheriteArmor].map(
	(card) => card.id,
)

const OreSnatcher: Achievement = {
	...achievement,
	numericId: 13,
	id: 'ore_snatcher',
	name: 'Ore Snatcher',
	description:
		"Use emerald to steal your opponent's gold, iron, diamond, or netherite armor 10 times.",
	steps: 10,
	onGameStart(game, playerEntity, component, observer) {
		const player = game.components.get(playerEntity)
		if (!player) return

		observer.subscribe(player.hooks.afterApply, () => {
			const SUSlot = game.components.find(
				SlotComponent,
				query.slot.singleUse,
				query.slot.player(playerEntity),
			)
			if (!SUSlot) return
			if (SUSlot.getCard()?.props !== Emerald) return
			if (!Armor.includes(player.activeRow?.getAttach()?.props.id || '')) return

			component.incrementGoalProgress(0)
		})
	},
}

export default OreSnatcher
