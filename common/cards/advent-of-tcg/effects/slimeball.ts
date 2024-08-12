import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

const Slimeball: Attach = {
	...attach,
	id: 'slimeball',
	numericId: 204,
	name: 'Slimeball',
	rarity: 'ultra_rare',
	tokens: 0,
	expansion: 'advent_of_tcg',
	description:
		"Attach to any Hermit, including your opponent's. That Hermit and its attached items will not be removed from the slot they are attached to, unless that Hermit is knocked out. Attached cards cannot be removed until slimeball is discarded.",
	attachCondition: query.every(
		query.slot.attach,
		query.slot.empty,
		query.slot.row(query.row.hasHermit),
		query.actionAvailable('PLAY_EFFECT_CARD'),
		query.not(query.slot.frozen),
	),
	onAttach(
		_game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.freezeSlots, () => {
			if (!component.slot.inRow()) return query.nothing
			return query.every(
				query.slot.player(player.entity),
				query.slot.rowIs(component.slot.rowEntity),
				query.not(query.slot.attach),
				query.not(query.slot.empty),
			)
		})
	},
}

export default Slimeball
