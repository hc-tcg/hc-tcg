import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import Card from '../../base/card'
import {CardComponent} from '../../../components'
import {Attach, HasHealth} from '../../base/types'
import {attach, hermit} from '../../base/defaults'

class ArmorStand extends Card {
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

	override onAttach(_game: GameModel, component: CardComponent, observer: Observer) {
		component.player.hooks.freezeSlots.add(component, () => {
			if (!component.slot?.onBoard()) return query.nothing
			return query.every(
				slot.player(component.player.entity),
				slot.rowIs(component.slot.row?.entity)
			)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		game.battleLog.addEntry(player.entity, `$pArmor Stand$ was knocked out`)
		player.hooks.freezeSlots.remove(component)
	}
}

export default ArmorStand
