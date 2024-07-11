import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
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

	override onAttach(game: GameModel, instance: CardComponent) {
		instance.player.hooks.freezeSlots.add(instance, () => {
			if (!instance.slot?.onBoard()) return slot.nothing
			return slot.every(slot.currentPlayer, slot.row(instance.slot.row?.entity))
		})
	}

	override onDetach(game: GameModel, instance: CardComponent) {
		const {player, opponentPlayer} = instance
		game.battleLog.addEntry(player.id, `$pArmor Stand$ was knocked out`)
		player.hooks.freezeSlots.remove(instance)
	}
}

export default ArmorStandEffectCard
