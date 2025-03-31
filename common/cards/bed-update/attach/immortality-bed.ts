import {
	CardComponent,
	ObserverComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {rowRevive} from '../../../types/priorities'
import {attach} from '../../defaults'
import {Attach} from '../../types'

const ImmortalityBed: Attach = {
	...attach,
	id: 'immortality_bed',
	numericId: 265,
	expansion: 'default',
	name: 'Immortality Bed',
	rarity: 'ultra_rare',
	tokens: 5,
	description:
		'When the hermit this bed is attached to is knocked out, return the hermit to your hand and do not lose a life.\nThis card can not be returned to your hand from your discard pile.\nYou may only have one copy of this card in your deck.',
	sidebarDescriptions: [
		{
			type: 'glossary',
			name: 'knockout',
		},
	],
	attachCondition: query.every(attach.attachCondition, query.slot.active),
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			game.hooks.rowRevive,
			rowRevive.IMMORTALITY_RETURN,
			(attack) => {
				if (!attack.isTargeting(component)) return
				let target = attack.target

				if (!target) return

				let targetHermit = target.getHermit()
				if (targetHermit?.isAlive()) return

				if (!component.slot.inRow()) return

				game.components.get(component.slot.row.hermitSlot.cardEntity)?.draw()
			},
		)
	},
}

export default ImmortalityBed
