import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import {onTurnEnd} from '../../../types/priorities'
import {attach} from '../../defaults'
import {Attach} from '../../types'

const HealthyBed: Attach = {
	...attach,
	id: 'healthy_bed',
	numericId: 266,
	expansion: 'beds',
	name: 'Healthy Bed',
	rarity: 'ultra_rare',
	tokens: 2,
	description:
		'At the end of any turn, heal the hermit this bed is attached to by 10hp.',
	onAttach(
		_game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (!component.slot.inRow()) return

				component.slot.row.heal(10)
			},
		)
		observer.subscribeWithPriority(
			opponentPlayer.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				if (!component.slot.inRow()) return

				component.slot.row.heal(10)
			},
		)
	},
}

export default HealthyBed
