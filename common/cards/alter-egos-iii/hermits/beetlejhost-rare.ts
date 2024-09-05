import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import ChromaKeyedEffect from '../../../status-effects/chroma-keyed'
import {afterAttack} from '../../../types/priorities'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

const BeetlejhostRare: Hermit = {
	...hermit,
	id: 'beetlejhost_rare',
	numericId: 151,
	name: 'Beetlejhost',
	expansion: 'alter_egos_iii',
	background: 'alter_egos',
	palette: 'alter_egos',
	rarity: 'rare',
	tokens: 1,
	type: 'balanced',
	health: 300,
	primary: {
		name: 'Abacus',
		cost: ['any'],
		damage: 30,
		power: null,
	},
	secondary: {
		name: 'Jopacity',
		cost: ['balanced', 'balanced'],
		damage: 100,
		power:
			'This attack does 10hp less damage every time it is used on consecutive turns.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	): void {
		const {player} = component

		observer.subscribeWithPriority(
			player.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				const chromakeyed = game.components.filter(
					StatusEffectComponent,
					query.effect.targetEntity(component.entity),
					query.effect.is(ChromaKeyedEffect),
				)[0]
				if (!chromakeyed) {
					game.components
						.new(StatusEffectComponent, ChromaKeyedEffect, component.entity)
						.apply(component.entity)
				}
			},
		)
	},
}

export default BeetlejhostRare
