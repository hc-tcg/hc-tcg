import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import Egg from '../single-use/egg'
import {Hermit} from '../types'

const PoultryManRare: Hermit = {
	...hermit,
	id: 'poultryman_rare',
	numericId: 178,
	name: 'Poultry Man',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 3,
	type: 'farm',
	health: 280,
	primary: {
		name: "It wasn't me",
		cost: ['farm'],
		damage: 50,
		power: null,
	},
	secondary: {
		name: 'It Was The Man In The Chicken Costume',
		shortName: 'Chicken C.',
		cost: ['farm', 'farm', 'any'],
		damage: 90,
		power:
			'When used with an Egg effect card, Egg is returned to your hand instead of being discarded.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				if (
					!game.components.exists(
						CardComponent,
						query.card.slot(query.slot.singleUse),
						query.card.is(Egg),
					) ||
					player.singleUseCardUsed
				)
					return

				observer.subscribe(player.hooks.afterApply, () => {
					game.components
						.find(
							CardComponent,
							query.card.slot(query.slot.singleUse),
							query.card.is(Egg),
						)
						?.draw()
					observer.unsubscribe(player.hooks.afterApply)
				})
			},
		)
	},
}

export default PoultryManRare
