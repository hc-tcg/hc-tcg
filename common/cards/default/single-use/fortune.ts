import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

// We could stop displaying the coin flips but I think it may confuse players when Zedaph or Pearl uses fortune.
class Fortune extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'fortune',
		numericId: 26,
		name: 'Fortune',
		expansion: 'default',
		rarity: 'ultra_rare',
		tokens: 1,
		description: 'Any coin flips on this turn are not required, as "heads" is assumed.',
		showConfirmationModal: true,
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onApply.add(component, () => {
			player.hooks.onCoinFlip.add(component, (card, coinFlips) => {
				for (let i = 0; i < coinFlips.length; i++) {
					coinFlips[i] = 'heads'
				}
				return coinFlips
			})

			player.hooks.onTurnStart.add(component, () => {
				player.hooks.onTurnStart.remove(component)
				player.hooks.onCoinFlip.remove(component)
			})
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onApply.remove(component)
	}
}

export default Fortune
