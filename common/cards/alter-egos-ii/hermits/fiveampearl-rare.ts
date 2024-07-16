import {GameModel} from '../../../models/game-model'
import {CardComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {card} from '../../../components/query'
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

	override onAttach(game: GameModel, component: CardComponent, observer: Observer) {
		const {player} = component

		player.hooks.beforeAttack.add(component, (attack) => {
			if (attack.attacker?.entity !== component.entity || attack.type !== 'secondary') return

			if (!game.components.find(CardComponent, card.currentPlayer, card.active, card.is(Wolf)))
				return

			attack.addDamage(component.entity, 30)
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.beforeAttack.remove(component)
		player.hooks.onTurnEnd.remove(component)
	}
}

export default FiveAMPearlRare
