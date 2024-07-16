import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import Card from '../../base/card'
import {CardComponent, ObserverComponent} from '../../../components'
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

	override onAttach(_game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component
		observer.subscribe(player.hooks.freezeSlots, () => {
			if (!component.slot?.onBoard()) return query.nothing
			return query.every(
				slot.player(component.player.entity),
				slot.rowIs(component.slot.row?.entity)
			)
		})
	}
}

export default ArmorStand
