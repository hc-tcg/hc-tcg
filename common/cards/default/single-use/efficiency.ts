import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class Efficiency extends Card {
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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.add(component, () => {
			player.hooks.availableEnergy.add(component, (availableEnergy) => {
				// Unliimited powwa
				return ['any', 'any', 'any']
			})

			player.hooks.afterAttack.add(component, (attack) => {
				player.hooks.availableEnergy.remove(component)
				player.hooks.afterAttack.remove(component)
				player.hooks.onTurnEnd.remove(component)
			})

			// In case the player does not attack
			player.hooks.onTurnEnd.add(component, () => {
				player.hooks.availableEnergy.remove(component)
				player.hooks.afterAttack.remove(component)
				player.hooks.onTurnEnd.remove(component)
			})
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default Efficiency
