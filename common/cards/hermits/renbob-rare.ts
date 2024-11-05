import {CardComponent, ObserverComponent, RowComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const RenbobRare: Hermit = {
	...hermit,
	id: 'renbob_rare',
	numericId: 109,
	name: 'Renbob',
	expansion: 'alter_egos',
	palette: 'alter_egos',
	background: 'alter_egos',
	rarity: 'rare',
	tokens: 2,
	type: ['explorer'],
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
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_SET_TARGET,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				if (!component.slot.inRow()) return
				// Renbob should not retarget if opponent can only play one Hermit
				if (
					game.components.filter(
						RowComponent,
						query.row.player(attack.player.opponentPlayer.entity),
					).length === 1
				)
					return
				attack.setTarget(
					component.entity,
					game.components.find(
						RowComponent,
						query.row.opponentPlayer,
						query.row.index(component.slot.row.index),
					)?.entity || null,
				)
			},
		)
	},
}

export default RenbobRare
