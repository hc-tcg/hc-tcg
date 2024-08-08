import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

const DiamondArmor: Attach = {
	...attach,
	id: 'diamond_armor',
	numericId: 13,
	name: 'Diamond Armour',
	expansion: 'default',
	rarity: 'rare',
	tokens: 3,
	description:
		'When the Hermit this card is attached to takes damage, that damage is reduced by up to 30hp each turn.',
	onAttach(
		_game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		let damageBlocked = 0

		observer.subscribe(player.hooks.onDefence, (attack) => {
			if (!attack.isTargeting(component) || attack.isType('status-effect'))
				return

			if (damageBlocked < 30) {
				const damageReduction = Math.min(
					attack.calculateDamage(),
					30 - damageBlocked,
				)
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
	},
}

export default DiamondArmor
