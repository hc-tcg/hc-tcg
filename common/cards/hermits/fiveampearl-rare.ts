import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import Wolf from '../attach/wolf'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const FiveAMPearlRare: Hermit = {
	...hermit,
	id: 'fiveampearl_rare',
	numericId: 796,
	name: '5AM Pearl',
	expansion: 'alter_egos',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	type: ['balanced'],
	health: 270,
	primary: {
		name: 'Wicked',
		cost: ['balanced'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Dogs of War',
		cost: ['balanced', 'balanced'],
		damage: 70,
		power:
			'If Wolf card is attached to this Hermit, do an additional 30hp damage.',
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

				if (
					!game.components.find(
						CardComponent,
						query.card.currentPlayer,
						query.card.active,
						query.card.is(Wolf),
					)
				)
					return

				attack.addDamage(component.entity, 30)
			},
		)
	},
}

export default FiveAMPearlRare
