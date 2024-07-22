import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'
import SmallishbeansCommon from './smallishbeans-common'
import KingJoelCommon from '../../alter-egos-iii/hermits/kingjoel-common'

class SmallishbeansRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'smallishbeans_rare',
		numericId: 161,
		name: 'Joel',
		expansion: 'season_x',
		background: 'alter_egos',
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
				'For each of your AFK Joels or King Joels on the game board, do an additional 10hp damage',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const joelQuantity = game.components.filter(
				CardComponent,
				query.card.currentPlayer,
				query.card.attached,
				query.card.is(SmallishbeansCommon, SmallishbeansRare, KingJoelCommon, KingJoelCommon),
				query.not(query.card.active)
			).length

			attack.addDamage(component.entity, joelQuantity * 10)
		})
	}
}

export default SmallishbeansRare
