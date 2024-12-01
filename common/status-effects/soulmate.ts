import Totem from '../cards/attach/totem'
import {
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {beforeAttack, onTurnEnd} from '../types/priorities'
import {DeathloopReady} from './death-loop'
import {IgnoreAttachSlotEffect} from './ignore-attach'
import {StatusEffect, systemStatusEffect} from './status-effect'

export const soulmateEffectDamage = 80

function updateDescription(soulmateEffect: StatusEffectComponent) {
	const {creator} = soulmateEffect
	if (!creator.slot.inRow()) return
	soulmateEffect.description = `If you knock out ${creator.props.name} (${creator.slot.row.index + 1}), your active Hermit takes ${soulmateEffectDamage}hp damage.`
}

const SoulmateEffect: StatusEffect<PlayerComponent> = {
	...systemStatusEffect,
	id: 'soulmate',
	icon: 'soulmate',
	name: 'Soulmate',
	description: `If you knock out BigB, your active Hermit takes ${soulmateEffectDamage}hp damage.`,
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

		updateDescription(effect)

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.REACT_TO_DAMAGE,
			(attack) => {
				if (
					!attack.isTargeting(creator) ||
					!attack.target?.health ||
					attack.target.health > attack.calculateDamage()
				)
					return
				// Do not trigger if creator will revive
				if (
					attack.target.getAttach()?.props.id === Totem.id &&
					creator.getStatusEffect(IgnoreAttachSlotEffect) === null
				)
					return
				if (creator.getStatusEffect(DeathloopReady) !== null) return

				const statusEffectAttack = game.newAttack({
					attacker: effect.creatorEntity,
					target: player.activeRowEntity,
					type: 'status-effect',
					isBacklash: true,
					log: (values) =>
						`${values.target} took ${values.damage} from $e${effect.props.name}$`,
				})
				statusEffectAttack.addDamage(effect.entity, soulmateEffectDamage)

				observer.unsubscribe(game.hooks.afterAttack)
				attack.addNewAttack(statusEffectAttack)

				effect.remove()
			},
		)

		observer.subscribe(creator.hooks.onChangeSlot, (_newSlot) => {
			updateDescription(effect)
		})

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
