import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'

class NetheriteBoots extends Card {
	props: Attach = {
		...attach,
		id: 'netherite_boots',
		numericId: 187,
		name: 'Netherite Boots',
		expansion: 'alter_egos_iii',
		rarity: 'ultra_rare',
		tokens: 3,
		description:
			'When the Hermit this card is attached to takes damage, that damage is reduced by up to 20hp each turn. Also any damage from effect cards and any damage redirected by effect cards. Opponent can not make this Hermit go AFK.',
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

export default NetheriteBoots
