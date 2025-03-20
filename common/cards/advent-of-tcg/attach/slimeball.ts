import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {IgnoreAttachSlotEffect} from '../../../status-effects/ignore-attach'
import {attach} from '../../defaults'
import {Attach} from '../../types'

const Slimeball: Attach = {
	...attach,
	id: 'slimeball',
	numericId: 511,
	name: 'Slimeball',
	rarity: 'rare',
	tokens: 0,
	expansion: 'minecraft',
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
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(game.hooks.freezeSlots, () => {
			if (
				!component.slot.inRow() ||
				component.slot.row.getHermit()?.getStatusEffect(IgnoreAttachSlotEffect)
			)
				return query.nothing
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
