import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import Card, {Attach, HasHealth, attach, hermit} from '../../base/card'
import {CardComponent} from '../../../types/game-state'

class ArmorStandEffectCard extends Card {
	props: Attach & HasHealth = {
		...attach,
		id: 'armor_stand',
		numericId: 118,
		name: 'Armour Stand',
		expansion: 'alter_egos',
		rarity: 'ultra_rare',
		tokens: 2,
		health: 50,
		description:
			'Use like a Hermit card with a maximum 50hp.\nYou can not attach any cards to this card. While this card is active, you can not attack, or use damaging effect cards.\nIf this card is knocked out, it does not count as a knockout.',
		sidebarDescriptions: [
			{
				type: 'glossary',
				name: 'knockout',
			},
		],
		attachCondition: hermit.attachCondition,
		log: hermit.log,
	}

	override onAttach(game: GameModel, component: CardComponent) {
		component.player.hooks.freezeSlots.add(component, () => {
			if (!component.slot?.onBoard()) return slot.nothing
			return slot.every(slot.currentPlayer, slot.row(component.slot.row?.entity))
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component
		game.battleLog.addEntry(player.id, `$pArmor Stand$ was knocked out`)
		player.hooks.freezeSlots.remove(component)
	}
}

export default ArmorStandEffectCard
