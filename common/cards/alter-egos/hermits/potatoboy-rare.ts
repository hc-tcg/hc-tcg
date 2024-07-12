import {GameModel} from '../../../models/game-model'
import {card, row, slot} from '../../../components/query'
import Card from '../../base/card'
import {Hermit} from '../../base/types'
import {hermit} from '../../base/defaults'
import {CardComponent, RowComponent} from '../../../components'

class PotatoBoyRareHermitCard extends Card {
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

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.onAttack.add(component, (attack) => {
			game.components.filter(RowComponent, row.currentPlayer).forEach((row) => {
				row.heal(40)
				let hermit = game.components.find(
					CardComponent,
					card.row(row.entity),
					card.slotFulfills(slot.activeRow)
				)
				game.battleLog.addEntry(
					player.entity,
					`$p${hermit?.props.name} (${row.index + 1})$ was healed $g40hp$ by $p${
						component.props.name
					}$`
				)
			})
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.onAttack.remove(component)
	}
}

export default PotatoBoyRareHermitCard
