import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {AttackModel} from '../models/attack-model'
import {GameModel} from '../models/game-model'
import {Counter, systemStatusEffect} from './status-effect'

const ChromaKeyedEffect: Counter<CardComponent> = {
	...systemStatusEffect,
	id: 'chroma-keyed',
	icon: 'chroma-keyed',
	name: 'Chroma Keyed',
	description:
		'You deal 10hp less damage for each level of this status effect.',
	counter: 1,
	counterType: 'number',
	onApply(
		_game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent,
	): void {
		if (!effect.counter) effect.counter = this.counter

		let chromaUsedThisTurn = true

		observer.subscribe(target.player.hooks.onAttack, (attack: AttackModel) => {
			if (
				[
					attack.isAttacker(target.entity) && attack.type === 'primary',
					!attack.isAttacker(target.entity) &&
						attack.isType('primary', 'secondary'),
				].some(Boolean)
			) {
				effect.remove()
				return
			}

			if (effect.counter === null) return

			if (attack.isAttacker(target.entity) && attack.type === 'secondary') {
				attack.reduceDamage(effect.entity, effect.counter * 10)
				effect.counter++
				chromaUsedThisTurn = true
			}
		})

		observer.subscribe(target.player.hooks.onTurnEnd, () => {
			if (!chromaUsedThisTurn) effect.remove()
			chromaUsedThisTurn = false
		})
	},
}

export default ChromaKeyedEffect
