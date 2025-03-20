import {
	CardComponent,
	HandSlotComponent,
	ObserverComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack, onTurnEnd} from '../../../types/priorities'
import {attach} from '../../defaults'
import {InstantHealthII} from '../../single-use/instant-health'
import {Attach, HasHealth} from '../../types'

const BerryBush: Attach & HasHealth = {
	...attach,
	id: 'berry_bush',
	numericId: 334,
	name: 'Sweet Berry Bush',
	expansion: 'decked_out',
	rarity: 'rare',
	tokens: 2,
	health: 30,
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
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {opponentPlayer} = component

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (attack.player.entity !== opponentPlayer.entity) return
				if (component.slot.inRow() && !component.slot.row.health) {
					for (let i = 0; i < 2; i++) {
						game.components.new(
							CardComponent,
							InstantHealthII,
							game.components.new(HandSlotComponent, opponentPlayer.entity)
								.entity,
						)
					}
					observer.unsubscribe(game.hooks.afterAttack)
				}
			},
		)

		observer.subscribeWithPriority(
			opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (component.slot.inRow() && component.slot.row.health)
					component.slot.row.damage(10)
			},
		)
		observer.subscribe(game.hooks.freezeSlots, () => {
			if (!component.slot.inRow()) return query.nothing
			return query.every(
				query.slot.player(component.player.entity),
				query.slot.rowIs(component.slot.row.entity),
			)
		})
	},
}

export default BerryBush
