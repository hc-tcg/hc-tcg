import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const SteampunkTangoRare: Hermit = {
	...hermit,
	id: 'steampunktango_rare',
	numericId: 174,
	name: 'Steampunk Tango',
	shortName: 'S. Tango',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 3,
	type: 'terraform',
	health: 270,
	primary: {
		name: 'Porkchop Power',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: 'Assembly line',
		cost: ['terraform', 'terraform'],
		damage: 80,
		power:
			'For each of your AFK Hermits on the game board, do an additional 10hp damage.',
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

				const afkHermits = game.components.filter(
					CardComponent,
					query.card.currentPlayer,
					query.card.slot(query.slot.hermit),
					query.not(query.card.active),
				).length

				attack.addDamage(component.entity, afkHermits * 10)
			},
		)
	},
}

export default SteampunkTangoRare
