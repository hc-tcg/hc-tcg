import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'

class Efficiency extends CardOld {
	props: SingleUse = {
		...singleUse,
		id: 'efficiency',
		numericId: 17,
		name: 'Efficiency',
		expansion: 'default',
		rarity: 'rare',
		tokens: 1,
		description:
			'Use an attack from your active Hermit without having the necessary item cards attached.',
		showConfirmationModal: true,
	}

	override onAttach(
		_game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component
		observer.subscribe(player.hooks.onApply, () => {
			observer.subscribe(player.hooks.availableEnergy, (_availableEnergy) => {
				// Unliimited powwa
				return ['any', 'any', 'any']
			})

			observer.subscribe(player.hooks.afterAttack, (_attack) => {
				observer.unsubscribe(player.hooks.availableEnergy)
				observer.unsubscribe(player.hooks.afterAttack)
				observer.unsubscribe(player.hooks.onTurnEnd)
			})

			// In case the player does not attack
			observer.subscribe(player.hooks.onTurnEnd, () => {
				observer.unsubscribe(player.hooks.availableEnergy)
				observer.unsubscribe(player.hooks.afterAttack)
				observer.unsubscribe(player.hooks.onTurnEnd)
			})
		})
	}
}

export default Efficiency
