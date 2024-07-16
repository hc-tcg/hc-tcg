import {GameModel} from '../../../models/game-model'
import {card, row} from '../../../components/query'
import Card from '../../base/card'
import {Hermit} from '../../base/types'
import {hermit} from '../../base/defaults'
import {CardComponent, RowComponent} from '../../../components'

class PotatoBoyRare extends Card {
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

	override onAttach(game: GameModel, component: CardComponent, observer: Observer) {
		const {player} = component

		player.hooks.onAttack.add(component, (_attack) => {
			game.components
				.filter(RowComponent, row.currentPlayer, row.adjacent(row.active))
				.forEach((row) => {
					row.heal(40)
					let hermit = row.getHermit()
					game.battleLog.addEntry(
						player.entity,
						`$p${hermit?.props.name} (${row.index + 1})$ was healed $g40hp$ by $p${
							component.props.name
						}$`
					)
				})
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onAttack.remove(component)
	}
}

export default PotatoBoyRare
