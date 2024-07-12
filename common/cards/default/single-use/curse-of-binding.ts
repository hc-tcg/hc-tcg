import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class CurseOfBindingSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'curse_of_binding',
		numericId: 11,
		name: 'Curse Of Binding',
		expansion: 'default',
		rarity: 'common',
		tokens: 0,
		description: 'Your opponent can not make their active Hermit go AFK on their next turn.',
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(component, () => {
			opponentPlayer.hooks.onTurnStart.add(component, () => {
				game.addBlockedActions(this.props.id, 'CHANGE_ACTIVE_HERMIT')

				opponentPlayer.hooks.onTurnStart.remove(component)
			})
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onApply.remove(component)
	}
}

export default CurseOfBindingSingleUseCard
