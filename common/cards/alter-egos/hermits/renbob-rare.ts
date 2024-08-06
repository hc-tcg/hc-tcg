import {
	CardComponent,
	ObserverComponent,
	RowComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const EMPTY_ROW = '$o$bINVALID VALUE$$'

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
			power:
				'Attack the Hermit directly opposite your active Hermit on the game board.',
		},
	}

	public override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
				return
			if (!component.slot.inRow()) return
			attack.setTarget(
				component.entity,
				game.components.find(
					RowComponent,
					query.row.opponentPlayer,
					query.row.index(component.slot.row.index),
				)?.entity || null,
			)
			attack.updateLog((values) => {
				if (values.previousLog === undefined) return ''
				return values.target === EMPTY_ROW
					? values.previousLog
							.replace(`${values.target} `, '')
							.replace(`for ${values.damage} damage`, 'and missed')
					: values.previousLog
			})
		})
	}
}

export default RenbobRare
