import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import KingJoelCommon from '../hermits/kingjoel-common'
import KingJoelRare from '../hermits/kingjoel-rare'
import {Hermit} from '../types'
import SmallishbeansCommon from './smallishbeans-common'

const SmallishbeansRare: Hermit = {
	...hermit,
	id: 'smallishbeans_rare',
	numericId: 161,
	name: 'Joel',
	expansion: 'season_x',
	rarity: 'rare',
	tokens: 2,
	type: 'explorer',
	health: 260,
	primary: {
		name: 'Neck Kisses',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Obsess',
		cost: ['explorer', 'explorer', 'any'],
		damage: 90,
		power:
			'For each AFK Joel or King Joel on the game board, do an additional 10hp damage.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const joelQuantity = game.components.filter(
					CardComponent,
					query.card.attached,
					query.card.is(
						SmallishbeansCommon,
						SmallishbeansRare,
						KingJoelCommon,
						KingJoelRare,
					),
					query.not(query.card.active),
				).length

				attack.addDamage(component.entity, joelQuantity * 10)
			},
		)
	},
}

export default SmallishbeansRare
