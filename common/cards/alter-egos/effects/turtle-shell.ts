import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
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
		_game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component
		let hasBeenActive = false

		observer.subscribe(player.hooks.onTurnEnd, () => {
			if (!component.slot.inRow()) return
			if (player.activeRowEntity === component.slot.row.entity) {
				hasBeenActive = true
			}
		})

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (hasBeenActive) {
				component.discard()
			}
		})

		observer.subscribe(player.hooks.onDefence, (attack) => {
			if (!component.slot.inRow()) return
			if (!hasBeenActive) return

			if (!attack.isTargeting(component)) return
			// Do not block backlash attacks
			if (attack.isBacklash) return

			if (attack.getDamage() > 0) {
				// Block all damage
				attack.multiplyDamage(component.entity, 0).lockDamage(component.entity)
			}
		})
	},
}

export default TurtleShell
