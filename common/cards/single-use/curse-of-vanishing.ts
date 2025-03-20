import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {singleUse} from '../defaults'
import {SingleUse} from '../types'

const discardCondition = query.every(
	query.slot.opponent,
	query.slot.active,
	query.slot.attach,
	query.not(query.slot.empty),
	query.not(query.slot.frozen),
)

const CurseOfVanishing: SingleUse = {
	...singleUse,
	id: 'curse_of_vanishing',
	numericId: 12,
	name: 'Curse Of Vanishing',
	expansion: 'default',
	rarity: 'common',
	tokens: 1,
	description:
		'Your opponent must discard any effect card attached to their active Hermit.',
	showConfirmationModal: true,
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(SlotComponent, discardCondition),
	),
	log: (values) => values.defaultLog,
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onApply, () => {
			game.components
				.filter(SlotComponent, discardCondition)
				.map((slot) => slot.card?.discard())
		})
	},
}

export default CurseOfVanishing
