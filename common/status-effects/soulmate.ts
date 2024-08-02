import {
	StatusEffectComponent,
	ObserverComponent,
	PlayerComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {
	PlayerStatusEffect,
	StatusEffectProps,
	systemStatusEffect,
} from './status-effect'
import {executeExtraAttacks} from '../utils/attacks'

export const soulmateEffectDamage = 140

class SoulmateEffect extends PlayerStatusEffect {
	props: StatusEffectProps = {
		...systemStatusEffect,
		icon: 'soulmate',
		name: 'Soulmate',
		description: `If you knock out %CREATOR%, your active Hermit takes ${soulmateEffectDamage}hp damage.`,
		applyCondition: (_game, value) => {
			return (
				value instanceof PlayerComponent &&
				!value.hasStatusEffect(SoulmateEffect)
			)
		},
	}

	override onApply(
		game: GameModel,
		effect: StatusEffectComponent<PlayerComponent>,
		player: PlayerComponent,
		observer: ObserverComponent,
	) {
		const {creator} = effect

		observer.subscribe(player.hooks.afterAttack, (attack) => {
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
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			effect.remove()
		})
	}
}

export default SoulmateEffect
