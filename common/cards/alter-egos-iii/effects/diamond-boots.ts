import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'

class DiamondBoots extends Card {
	props: Attach = {
		...attach,
		id: 'diamond_boots',
		numericId: 186,
		name: 'Diamond Boots',
		expansion: 'alter_egos_iii',
		rarity: 'rare',
		tokens: 2,
		description:
			'When the Hermit this card is attached to takes damage, that damage is reduced by up to 20hp each turn. any damage from effect cards and any damage redirected by effect cards.',
	}

	override onAttach(_game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		let damageBlocked = 0

		observer.subscribe(player.hooks.onDefence, (attack) => {
			if (!attack.isTargeting(component) || attack.isType('status-effect')) return

			if (damageBlocked < 20) {
				const damageReduction = Math.min(attack.calculateDamage(), 20 - damageBlocked)
				damageBlocked += damageReduction
				attack.reduceDamage(component.entity, damageReduction)
			}
		})

		const resetCounter = () => {
			damageBlocked = 0
		}

		// Reset counter at the start of every turn
		observer.subscribe(player.hooks.onTurnStart, resetCounter)
		observer.subscribe(opponentPlayer.hooks.onTurnStart, resetCounter)
	}
}

export default DiamondBoots
