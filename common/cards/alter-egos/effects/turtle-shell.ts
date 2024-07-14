import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

class TurtleShellEffectCard extends Card {
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
		attachCondition: query.every(attach.attachCondition, query.not(slot.activeRow)),
	}

	override onAttach(_game: GameModel, component: CardComponent) {
		const {player} = component
		let firstActiveTurn = true

		player.hooks.onTurnEnd.add(component, () => {
			if (!component.slot.inRow()) return
			if (player.activeRowEntity !== component.slot.row.entity) {
				firstActiveTurn = false
			}
		})

		player.hooks.onTurnStart.add(component, () => {
			if (!firstActiveTurn) {
				component.discard()
			}
		})

		player.hooks.onDefence.add(component, (attack) => {
			// Only block if just became active
			if (!firstActiveTurn) return
			if (!component.slot.inRow()) return
			// Only block damage when we are active
			const isActive = player.activeRowEntity === component.slot.row.entity
			if (!isActive || !attack.isTargetting(component)) return
			// Do not block backlash attacks
			if (attack.isBacklash) return

			if (attack.getDamage() > 0) {
				// Block all damage
				attack.multiplyDamage(component.entity, 0).lockDamage(component.entity)
			}
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onDefence.remove(component)
		player.hooks.onTurnEnd.remove(component)
		player.hooks.onTurnStart.remove(component)
	}
}

export default TurtleShellEffectCard
