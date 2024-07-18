import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent, RowComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {row} from '../../../components/query'

class RenbobRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'renbob_rare',
		numericId: 137,
		name: 'Renbob',
		expansion: 'alter_egos',
		palette: 'alter_egos',
		background: 'alter_egos',
		rarity: 'rare',
		tokens: 2,
		type: 'explorer',
		health: 300,
		primary: {
			name: 'Loose Change',
			cost: ['any'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: 'Hyperspace',
			cost: ['explorer', 'explorer'],
			damage: 80,
			power: 'Attack the Hermit card directly opposite this card on the game board.',
		},
	}

	public override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			if (!component.slot.inRow()) return
			attack.setTarget(
				component.entity,
				game.components.find(RowComponent, row.opponentPlayer, row.index(component.slot.row.index))
					?.entity || null
			)
		})
	}
}

export default RenbobRare
