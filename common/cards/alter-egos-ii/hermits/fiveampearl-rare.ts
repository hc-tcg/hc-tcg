import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import query from '../../../components/query'
import Wolf from '../../default/effects/wolf'

class FiveAMPearlRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'fiveampearl_rare',
		numericId: 230,
		name: '5AM Pearl',
		expansion: 'alter_egos_ii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'balanced',
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
			power: 'If Wolf card is attached to this Hermit, do an additional 30hp damage.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.beforeAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			if (
				!game.components.find(
					CardComponent,
					query.card.currentPlayer,
					query.card.active,
					query.card.is(Wolf)
				)
			)
				return

			attack.addDamage(component.entity, 30)
		})
	}
}

export default FiveAMPearlRare
