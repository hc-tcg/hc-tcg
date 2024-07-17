import {GameModel} from '../../../models/game-model'
import * as query from '../../../components/query'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'
import SleepingEffect from '../../../status-effects/sleeping'

class ChorusFruit extends Card {
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
					query.slot.currentPlayer,
					query.slot.hermitSlot,
					query.slot.activeRow,
					query.slot.hasStatusEffect(SleepingEffect)
				)
			)
		),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		let removedBlock = false

		observer.subscribe(player.hooks.onAttack, (_attack) => {
			// Apply the card
			applySingleUse(game, component.slot)
		})

		observer.subscribe(player.hooks.afterAttack, (_attack) => {
			if (removedBlock) return
			// Remove change active hermit from the blocked actions so it can be done once more
			game.removeCompletedActions('CHANGE_ACTIVE_HERMIT')
			game.removeBlockedActions('game', 'CHANGE_ACTIVE_HERMIT')
			removedBlock = true
			// If another attack loop runs let the blocked action be removed again
			observer.subscribe(player.hooks.beforeAttack, (attack) => {
				if (attack.isType('status-effect')) return // Ignore fire and poison attacks
				removedBlock = false
				observer.unsubscribe(player.hooks.beforeAttack)
			})
		})
	}
}

export default ChorusFruit
