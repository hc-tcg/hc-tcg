import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class TurtleShell extends Card {
	props: Attach = {
		...attach,
		id: 'turtle_shell',
		numericId: 125,
		name: 'Turtle Shell',
		expansion: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		description:
			"Attach to any of your AFK Hermits. On that Hermit's first turn after becoming active, any damage done by your opponent to that Hermit is prevented, and then this card is discarded.",
		attachCondition: query.every(attach.attachCondition, query.not(query.slot.active)),
	}

	override onAttach(_game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component
		let firstActiveTurn = true

		observer.subscribe(player.hooks.onTurnEnd, () => {
			if (!component.slot.inRow()) return
			if (player.activeRowEntity !== component.slot.row.entity) {
				firstActiveTurn = false
			}
		})

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (!firstActiveTurn) {
				component.discard()
			}
		})

		observer.subscribe(player.hooks.onDefence, (attack) => {
			// Only block if just became active
			if (!firstActiveTurn) return
			if (!component.slot.inRow()) return
			// Only block damage when we are active
			const isActive = player.activeRowEntity === component.slot.row.entity
			if (!isActive || !attack.isTargeting(component)) return
			// Do not block backlash attacks
			if (attack.isBacklash) return

			if (attack.getDamage() > 0) {
				// Block all damage
				attack.multiplyDamage(component.entity, 0).lockDamage(component.entity)
			}
		})
	}
}

export default TurtleShell
