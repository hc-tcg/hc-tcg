import {GameModel} from '../../../models/game-model'
import {slot} from '../../../components/query'
import {CardComponent} from '../../../types/game-state'
import {applySingleUse, getActiveRow} from '../../../utils/board'
import Card, {SingleUse, singleUse} from '../../base/card'

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
		attachCondition: slot.every(
			singleUse.attachCondition,
			slot.not(
				slot.someSlotFulfills(
					slot.every(slot.player, slot.hermitSlot, slot.activeRow, slot.hasStatusEffect('sleeping'))
				)
			)
		),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = pos

		let removedBlock = false

		player.hooks.onAttack.add(component, (attack) => {
			// Apply the card
			applySingleUse(game)

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
		const {player} = pos
		player.hooks.onAttack.remove(component)
	}
}

export default ChorusFruitSingleUseCard
