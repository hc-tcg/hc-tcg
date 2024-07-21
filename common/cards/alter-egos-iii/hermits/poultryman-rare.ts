import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'
import Egg from '../../alter-egos/single-use/egg'

class PoultryManRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'poultryman_rare',
		numericId: 178,
		name: 'Poultry Man',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 0,
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
			cost: ['farm', 'farm', 'any'],
			damage: 90,
			power: 'When played with egg, egg is returned to your hand instead of being discarded.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const singleUse = game.components.filter(
				CardComponent,
				query.card.slot(query.slot.singleUse)
			)[0]
			if (singleUse && singleUse instanceof Egg)
				observer.oneShot(player.hooks.afterAttack, () => {
					singleUse.draw(player.entity)
				})
		})
	}
}

export default PoultryManRare
