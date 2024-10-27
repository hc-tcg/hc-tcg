import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import ChromaKeyedEffect from '../../status-effects/chroma-keyed'
import {afterAttack, beforeAttack} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

function findChromaKeyed(
	game: GameModel,
	component: CardComponent,
): StatusEffectComponent | null {
	return game.components.find(
		StatusEffectComponent,
		query.effect.targetEntity(component.entity),
		query.effect.is(ChromaKeyedEffect),
	)
}

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
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				const chromaKeyed = findChromaKeyed(game, component)

				if (
					[
						attack.isAttacker(component.entity) && attack.type === 'primary',
						!attack.isAttacker(component.entity) &&
							attack.isType('primary', 'secondary'),
					].some(Boolean)
				) {
					chromaKeyed?.remove()
					return
				}

				if (!chromaKeyed || chromaKeyed.counter === null) return

				if (
					attack.isAttacker(component.entity) &&
					attack.type === 'secondary'
				) {
					attack.removeDamage(chromaKeyed.entity, chromaKeyed.counter * 10)
					chromaKeyed.counter++
				}
			},
		)

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.UPDATE_POST_ATTACK_STATE,
			(attack) => {
				if (attack.player.entity !== player.entity) return
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return

				if (!findChromaKeyed(game, component)) {
					game.components
						.new(StatusEffectComponent, ChromaKeyedEffect, component.entity)
						.apply(component.entity)
				}
			},
		)
	},
}

export default BeetlejhostRare
