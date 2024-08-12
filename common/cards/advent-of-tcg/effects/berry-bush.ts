import {
	CardComponent,
	HandSlotComponent,
	ObserverComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach, HasHealth} from '../../base/types'

class BerryBush extends Card {
	props: Attach & HasHealth = {
		...attach,
		id: 'berry_bush',
		numericId: 200,
		name: 'Sweet Berry Bush',
		expansion: 'advent_of_tcg',
		rarity: 'ultra_rare',
		tokens: 2,
		health: 50,
		description:
			"Use like a Hermit card. Place on one of your opponent's empty Hermit slots. Has 30hp.\nCan not attach cards to it.\nYou do not get a point when it's knocked out.\nLoses 10hp per turn. If you knock out Sweet Berry Bush before it's HP becomes 0, add 2 Instant Healing II into your hand.",
		attachCondition: query.every(
			query.slot.opponent,
			query.slot.hermit,
			query.slot.empty,
			query.slot.playerHasActiveHermit,
			query.slot.opponentHasActiveHermit,
			query.not(query.slot.frozen),
		),
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribe(opponentPlayer.hooks.afterAttack, () => {
			if (component.slot.inRow() && !component.slot.row.health) {
				for (let i = 0; i < 2; i++) {
					game.components.new(
						CardComponent,
						'instant_health_ii',
						game.components.new(HandSlotComponent, opponentPlayer.entity)
							.entity,
					)
				}
			}
		})

		observer.subscribe(opponentPlayer.hooks.onTurnEnd, () => {
			if (component.slot.inRow() && component.slot.row.health)
				component.slot.row.damage(10)
		})
		observer.subscribe(player.hooks.freezeSlots, () => {
			if (!component.slot.inRow()) return query.nothing
			return query.every(
				query.slot.player(component.player.entity),
				query.slot.rowIs(component.slot.row.entity),
			)
		})
	}
}

export default BerryBush
