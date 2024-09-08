import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {beforeDefence} from '../../../types/priorities'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

const TurtleShell: Attach = {
	...attach,
	id: 'turtle_shell',
	numericId: 125,
	name: 'Turtle Shell',
	expansion: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	description:
		"Attach to any of your AFK Hermits. On that Hermit's first turn after becoming active, any damage done by your opponent to that Hermit is prevented, and then this card is discarded.",
	attachCondition: query.every(
		attach.attachCondition,
		query.not(query.slot.active),
	),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component
		let activated = false

		observer.subscribe(
			player.hooks.onActiveRowChange,
			(_oldActiveHermit, newActiveHermit) => {
				const hermitCard = game.components.find(
					CardComponent,
					query.card.isHermit,
					query.card.row(query.row.hasCard(component.entity)),
				)

				if (hermitCard && newActiveHermit.entity === hermitCard.entity) {
					activated = true
				}
			},
		)

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (activated) {
				component.discard()
			}
		})

		observer.subscribeWithPriority(
			player.hooks.beforeDefence,
			beforeDefence.EFFECT_BLOCK_DAMAGE,
			(attack) => {
				if (!component.slot.inRow()) return
				if (!activated) return

				if (!attack.isTargeting(component)) return
				// Do not block backlash or status-effect attacks
				if (attack.isBacklash || attack.isType('status-effect')) return

				if (attack.getDamage() > 0) {
					// Block all damage
					attack
						.multiplyDamage(component.entity, 0)
						.lockDamage(component.entity)
				}
			},
		)
	},
}

export default TurtleShell
