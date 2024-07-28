import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import Card from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'
import FireEffect from '../../../status-effects/fire'

class LavaBucket extends Card {
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
		attachCondition: query.every(singleUse.attachCondition, query.slot.opponentHasActiveHermit),
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'fire',
			},
		],
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.new(StatusEffectComponent, FireEffect, component.entity)
				.apply(opponentPlayer.getActiveHermit()?.entity)
		})
	}
}

export default LavaBucket
