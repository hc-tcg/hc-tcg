import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import {isTargeting} from '../../../utils/attacks'
import {discardCard} from '../../../utils/movement'
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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component
		let firstActiveTurn = true

		player.hooks.onTurnEnd.add(component, () => {
			if (player.board.activeRow === pos.rowIndex) {
				firstActiveTurn = true
			}
		})

		player.hooks.onTurnStart.add(component, () => {
			if (firstActiveTurn) {
				discardCard(game, pos.cardId)
			}
		})

		player.hooks.onDefence.add(component, (attack) => {
			// Only block if just became active
			if (!firstActiveTurn) return
			// Only block damage when we are active
			const isActive = player.board.activeRow === pos.rowIndex
			if (!isActive || !isTargeting(attack, pos)) return
			// Do not block backlash attacks
			if (attack.isBacklash) return

			if (attack.getDamage() > 0) {
				// Block all damage
				attack.multiplyDamage(this.props.id, 0).lockDamage(this.props.id)
			}
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		const componentKey = this.getInstanceKey(component)

		player.hooks.onDefence.remove(component)
		player.hooks.onTurnEnd.remove(component)
		player.hooks.onTurnStart.remove(component)
	}
}

export default TurtleShellEffectCard
