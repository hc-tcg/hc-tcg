import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import KingJoelCommon from '../../alter-egos-iii/hermits/kingjoel-common'
import CardOld from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import SmallishbeansCommon from './smallishbeans-common'

class SmallishbeansRare extends CardOld {
	props: Hermit = {
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
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return

			const joelQuantity = game.components.filter(
				CardComponent,
				query.card.attached,
				query.card.is(
					SmallishbeansCommon,
					SmallishbeansRare,
					KingJoelCommon,
					KingJoelCommon,
				),
				query.not(query.card.active),
			).length

			attack.addDamage(component.entity, joelQuantity * 10)
		})
	}
}

export default SmallishbeansRare
