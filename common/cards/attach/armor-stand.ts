import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {attach, hermit} from '../defaults'
import {Attach, HasHealth} from '../types'

const ArmorStand: Attach & HasHealth = {
	...attach,
	id: 'armor_stand',
	numericId: 111,
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
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		observer.subscribe(game.hooks.freezeSlots, () => {
			if (!component.slot?.onBoard()) return query.nothing
			return query.every(
				query.some(query.slot.item, query.slot.attach),
				query.slot.player(component.player.entity),
				query.slot.rowIs(component.slot.row?.entity),
			)
		})

		observer.subscribe(component.hooks.onChangeSlot, (slot) => {
			if (!slot.inRow()) return
			game.components
				.filter(
					CardComponent,
					query.card.slot(query.some(query.slot.item, query.slot.attach)),
					query.card.rowEntity(slot.row.entity),
				)
				.forEach((card) => {
					card.discard()
				})
		})
	},
}

export default ArmorStand
