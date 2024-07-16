import {GameModel} from '../../../models/game-model'
import {card, query, slot} from '../../../components/query'
import {CardComponent, StatusEffectComponent} from '../../../components'
import Card from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'
import FireStatusEffect from '../../../status-effects/fire'

class LavaBucketSingleUseCard extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'lava_bucket',
		numericId: 74,
		name: 'Lava Bucket',
		expansion: 'default',
		rarity: 'rare',
		tokens: 3,
		description: "Burn your opponent's active Hermit.",
		showConfirmationModal: true,
		attachCondition: query.every(singleUse.attachCondition, slot.opponentHasActiveHermit),
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'fire',
			},
		],
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = component

		player.hooks.onApply.add(component, () => {
			const opponentActiveHermit = game.components.find(
				CardComponent,
				card.currentPlayer,
				card.active,
				card.slot(slot.hermitSlot)
			)
			if (opponentActiveHermit === null) return
			game.components.new(StatusEffectComponent, FireStatusEffect).apply(opponentActiveHermit.entity)
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onApply.remove(component)
	}
}

export default LavaBucketSingleUseCard
