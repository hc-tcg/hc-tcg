import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {attach} from '../../base/defaults'
import {Attach} from '../../base/types'

const Loyalty: Attach = {
	...attach,
	id: 'loyalty',
	numericId: 77,
	name: 'Loyalty',
	expansion: 'default',
	rarity: 'rare',
	tokens: 0,
	description:
		'When the Hermit this card is attached to is knocked out, all attached item cards are returned to your hand.',
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.afterDefence, (attack) => {
			if (!component.slot.inRow() || component.slot.row.health) return
			if (!attack.target || !attack.isTargeting(component)) return

			game.components
				.filter(
					CardComponent,
					query.card.player(player.entity),
					query.card.row(query.row.index(attack.target.index)),
					query.card.slot(query.slot.item),
				)
				.forEach((card) => card.draw())
		})
	},
}

export default Loyalty
