import {GameModel} from '../../../models/game-model'
import {card, row, slot} from '../../../filters'
import {CardComponent} from '../../../types/game-state'
import Card, {Hermit, hermit} from '../../base/card'

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

	override onAttach(game: GameModel, instance: CardComponent) {
		const {player} = instance

		player.hooks.onAttack.add(instance, (attack) => {
			game.state.rows.filterEntities(row.currentPlayer).forEach((row) => {
				row.heal(40)
				let hermit = game.state.cards.find(
					card.row(row.entity),
					card.slotFulfills(slot.activeRow)
				)
				game.battleLog.addEntry(
					player.id,
					`$p${hermit?.props.name} (${row.index + 1})$ was healed $g40hp$ by $p${
						instance.props.name
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
