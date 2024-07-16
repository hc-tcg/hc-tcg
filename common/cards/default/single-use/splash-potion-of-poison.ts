import {GameModel} from '../../../models/game-model'
import {query, slot} from '../../../components/query'
import Card from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'
import {CardComponent} from '../../../components'

class SplashPotionOfPoisonSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'splash_potion_of_poison',
		numericId: 90,
		name: 'Splash Potion of Poison',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		description: "Poison your opponent's active Hermit.",
		showConfirmationModal: true,
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'poison',
			},
		],
		attachCondition: query.every(singleUse.attachCondition, slot.opponentHasActiveHermit),
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component

		player.hooks.onApply.add(component, () => {
			const opponentActiveRow = opponentPlayer.board.activeRow
			if (opponentActiveRow === null) return
			applyStatusEffect(
				game,
				'poison',
				opponentPlayer.board.rows[opponentActiveRow].hermitCard || undefined
			)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default SplashPotionOfPoisonSingleUseCard
