import {
	CardComponent,
	ObserverComponent,
	RowComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import CardOld from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class PotatoBoyRare extends CardOld {
	props: Hermit = {
		...hermit,
		id: 'potatoboy_rare',
		numericId: 135,
		name: 'Potato Boy',
		expansion: 'alter_egos',
		palette: 'alter_egos',
		background: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'farm',
		health: 270,
		primary: {
			name: 'Peace & Love',
			cost: ['farm'],
			damage: 0,
			power: 'Heal all Hermits that are adjacent to your active Hermit 40hp.',
		},
		secondary: {
			name: 'Volcarbo',
			cost: ['farm', 'farm', 'any'],
			damage: 90,
			power: null,
		},
	}

	override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'primary')
				return
			game.components
				.filter(
					RowComponent,
					query.row.currentPlayer,
					query.row.adjacent(query.row.active),
					query.row.hasHermit,
				)
				.forEach((row) => {
					row.heal(40)
					let hermit = row.getHermit()
					game.battleLog.addEntry(
						player.entity,
						`$p${hermit?.props.name} (${row.index + 1})$ was healed $g40hp$ by $p${
							component.props.name
						}$`,
					)
				})
		})
	}
}

export default PotatoBoyRare
