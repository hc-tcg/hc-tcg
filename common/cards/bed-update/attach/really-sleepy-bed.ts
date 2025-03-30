import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import PermanentSleepingEffect from '../../../status-effects/permanent-sleeping'
import {onTurnEnd} from '../../../types/priorities'
import {attach} from '../../defaults'
import {Attach} from '../../types'

const ReallySleepyBed: Attach = {
	...attach,
	id: 'bed',
	numericId: 262,
	expansion: 'default',
	name: 'Bed',
	rarity: 'ultra_rare',
	tokens: 2,
	description:
		'Attach to your active Hermit. The hermit this card is attached to goes to sleep forever.',
	sidebarDescriptions: [
		{
			type: 'statusEffect',
			name: 'sleeping',
		},
	],
	attachCondition: query.every(attach.attachCondition, query.slot.active),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		let hermitCard = () => {
			if (!component.slot.inRow()) return
			return game.components.find(
				CardComponent,
				query.card.rowEntity(component.slot.row.entity),
				query.card.slot(query.slot.hermit),
			)
		}

		game.components
			.new(StatusEffectComponent, PermanentSleepingEffect, component.entity)
			.apply(hermitCard()?.entity)
	},
}

export default ReallySleepyBed
