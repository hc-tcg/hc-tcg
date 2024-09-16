import {CardComponent, ObserverComponent} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {afterAttack} from '../../../types/priorities'
import Egg from '../../alter-egos/single-use/egg'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

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
			'When played with egg, egg is returned to your hand instead of being discarded.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			player.hooks.afterAttack,
			afterAttack.HERMIT_REMOVE_SINGLE_USE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const singleUse = game.components.find(
					CardComponent,
					query.card.slot(query.slot.singleUse),
					query.card.is(Egg),
				)

				singleUse?.draw()
			},
		)
	},
}

export default PoultryManRare
