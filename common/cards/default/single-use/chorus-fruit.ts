import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import SleepingStatusEffect from '../../../status-effects/sleeping'

class ChorusFruitSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'chorus_fruit',
		numericId: 5,
		name: 'Chorus Fruit',
		expansion: 'default',
		rarity: 'common',
		tokens: 1,
		description: 'After your attack, choose an AFK Hermit to set as your active Hermit.',
		log: (values) => `${values.defaultLog} with {your|their} attack`,
		attachCondition: query.every(
			singleUse.attachCondition,
			query.not(
				query.exists(
					SlotComponent,
					slot.currentPlayer,
					slot.hermitSlot,
					slot.activeRow,
					slot.hasStatusEffect(SleepingStatusEffect)
				)
			)
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		let removedBlock = false

		player.hooks.onAttack.add(component, (attack) => {
			// Apply the card
			applySingleUse(game, component.slot)

			player.hooks.afterAttack.add(component, (attack) => {
				if (removedBlock) return
				// Remove change active hermit from the blocked actions so it can be done once more
				game.removeCompletedActions('CHANGE_ACTIVE_HERMIT')
				game.removeBlockedActions('game', 'CHANGE_ACTIVE_HERMIT')
				removedBlock = true
				// If another attack loop runs let the blocked action be removed again
				player.hooks.beforeAttack.add(component, (attack) => {
					if (attack.isType('status-effect')) return // Ignore fire and poison attacks
					removedBlock = false
					player.hooks.beforeAttack.remove(component)
				})
			})

			player.hooks.onTurnEnd.add(component, (attack) => {
				player.hooks.beforeAttack.remove(component)
				player.hooks.afterAttack.remove(component)
				player.hooks.onTurnEnd.remove(component)
			})

			player.hooks.onAttack.remove(component)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onAttack.remove(component)
	}
}

export default ChorusFruitSingleUseCard
