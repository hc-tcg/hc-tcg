import {CardComponent, ObserverComponent, StatusEffectComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'
import ChromaKeyedEffect from '../../../status-effects/chroma-keyed'

class BeetlejhostRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'beetlejhost_rare',
		numericId: 151,
		name: 'Beetlejhost',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 0,
		type: 'balanced',
		health: 300,
		primary: {
			name: 'Abacus',
			cost: ['any'],
			damage: 30,
			power: null,
		},
		secondary: {
			name: 'Chroma',
			cost: ['balanced', 'balanced'],
			damage: 100,
			power: 'This attack does 10 hp less damage every time it is used consecutively.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent): void {
		const {player} = component

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const chromakeyed = game.components.filter(
				StatusEffectComponent,
				query.effect.targetEntity(component.entity),
				query.effect.id('chroma-keyed')
			)[0]
			if (!chromakeyed) {
				game.components.new(StatusEffectComponent, ChromaKeyedEffect).apply(component.entity)
			}
		})
	}
}

export default BeetlejhostRare
