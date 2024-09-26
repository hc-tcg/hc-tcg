import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {afterDefence, onTurnEnd} from '../types/priorities'
import {executeExtraAttacks} from '../utils/attacks'
import {StatusEffect, systemStatusEffect} from './status-effect'

export const soulmateEffectDamage = 140

const SoulmateEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'soulmate',
	icon: 'soulmate',
	name: 'Soulmate',
	description: `If you knock out %CREATOR%, your active Hermit takes ${soulmateEffectDamage}hp damage.`,
	applyCondition: (_game, value) => {
		return (
			value instanceof PlayerComponent && !value.hasStatusEffect(SoulmateEffect)
		)
	},
	onApply(
		game: GameModel,
		effect: StatusEffectComponent<PlayerComponent>,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		const {creator} = effect

		observer.subscribeWithPriority(
			player.hooks.afterDefence,
			afterDefence.ON_ROW_DEATH,
			(attack) => {
				if (!attack.isTargeting(creator) || attack.target!.health) return

				const statusEffectAttack = game.newAttack({
					attacker: effect.creatorEntity,
					target: player.activeRowEntity,
					type: 'status-effect',
					log: (values) =>
						`${values.target} took ${values.damage} from $e${effect.props.name}$`,
				})
				statusEffectAttack.addDamage(effect.entity, soulmateEffectDamage)

				observer.unsubscribe(player.hooks.afterAttack)
				executeExtraAttacks(game, [statusEffectAttack])

				effect.remove()
			},
		)

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.ON_STATUS_EFFECT_TIMEOUT,
			() => {
				effect.remove()
			},
		)
	},
}

export default SoulmateEffect
