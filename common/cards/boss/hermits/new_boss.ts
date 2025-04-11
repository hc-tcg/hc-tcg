import {
	CardComponent,
	ObserverComponent,
	RowComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import ExBossNineEffect from '../../../status-effects/exboss-nine'
import FireEffect from '../../../status-effects/fire'
import PoisonEffect from '../../../status-effects/poison'
import {
	PrimaryAttackDisabledEffect,
	SecondaryAttackDisabledEffect,
} from '../../../status-effects/singleturn-attack-disabled'
import SculkCatalystTriggeredEffect from '../../../status-effects/skulk-catalyst'
import SlownessEffect from '../../../status-effects/slowness'
import TFCDiscardedFromEffect from '../../../status-effects/tfc-discarded-from'
import {AttackLog, HermitAttackType} from '../../../types/attack'
import {afterApply, afterAttack, beforeAttack} from '../../../types/priorities'
import {InstancedValue} from '../../card'
import EvilXisumaRare from '../../hermits/evilxisuma_rare'
import {Hermit} from '../../types'

type PRIMARY_ATTACK = '50DMG' | '70DMG' | '90DMG'
type SECONDARY_ATTACK = 'DOUBLE' | 'HEAL150' | 'ABLAZE' | 'AFK20'
type EFFECT_CARD = 'EFFECTCARD' | undefined

type BOSS_ATTACK = [PRIMARY_ATTACK, SECONDARY_ATTACK | undefined, EFFECT_CARD]

const bossAttacks = new InstancedValue<BOSS_ATTACK>(() => ['50DMG', undefined, undefined])

function supplyBossAttack(card: CardComponent, attack: BOSS_ATTACK) {
	bossAttacks.set(card, attack)
}

const attackLog = (bossAttack: BOSS_ATTACK): ((values: AttackLog) => string) => {
	return (values) => {
		let log = `${values.damage} damage`
		if (bossAttack[1] === 'DOUBLE') log += ' (doubled)'
		if (bossAttack[2] === 'EFFECTCARD') log += ' and discarded an effect card'
		return log
	}
}

const effectDiscardCondition = query.card.slot(
	query.slot.opponent,
	query.slot.active,
	query.slot.attach,
	query.not(query.slot.frozen),
)

/** Boss is immune to poison, fire, and slowness */
function removeImmuneEffects(game: GameModel, slot: SlotComponent) {
	if (!slot) return
	game.components
		.filter(
			StatusEffectComponent,
			query.effect.targetIsCardAnd(query.card.slotEntity(slot.entity)),
			query.effect.is(PoisonEffect, FireEffect, SlownessEffect),
		)
		.forEach((effect) => effect.remove())
}

const damageDisabled = new InstancedValue<boolean>(() => false)

const NewBoss: Hermit = {
	...EvilXisumaRare,
	id: 'new_boss',
	numericId: -1,
	expansion: 'boss',
	health: 300,

	getAttack(
		game: GameModel,
		component: CardComponent,
		hermitAttackType: HermitAttackType,
	) {
		const bossAttack = bossAttacks.get(component)

		const attack = game
			.newAttack({
				attacker: component.entity,
				target: game.components.findEntity(
					RowComponent,
					query.row.opponentPlayer,
					query.row.active,
				),
				type: hermitAttackType,
				createWeakness: 'ifWeak',
				log: attackLog(bossAttack),
			})
			.addDamage(component.entity, Number(bossAttack[0].substring(0, 2)))

		const disabled = game.components.exists(
			StatusEffectComponent,
			query.effect.targetIsCardAnd(query.card.entity(component.entity)),
			query.effect.is(
				PrimaryAttackDisabledEffect,
				SecondaryAttackDisabledEffect,
			),
		)
		damageDisabled.set(component, disabled)

		if (bossAttack[2] === 'EFFECTCARD') {
			game.components.find(CardComponent, effectDiscardCondition)?.discard()
		}

		if (disabled) {
			attack.multiplyDamage(component.entity, 0).lockDamage(component.entity)
		} else {
			if (bossAttack[1] === 'DOUBLE') attack.multiplyDamage(component.entity, 2)

			if (bossAttack[1] === 'AFK20') {
				game.components
					.filter(
						RowComponent,
						query.row.opponentPlayer,
						query.row.hasHermit,
						query.not(query.row.active),
					)
					.forEach((afkRow) => {
						const newAttack = game
							.newAttack({
								attacker: component.entity,
								target: afkRow.entity,
								type: hermitAttackType,
								log: (values) =>
									`, ${values.damage} damage to ${values.target}`,
							})
							.addDamage(component.entity, 20)
						newAttack.shouldIgnoreCards.push(
							query.card.entity(component.entity),
						)
						attack.addNewAttack(newAttack)
					})
			}
		}

		return attack
	},

	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		// Apply an ailment to act on boss's ninth turn
		game.components
			.new(StatusEffectComponent, ExBossNineEffect, component.entity)
			.apply(component.entity)

		const {player, opponentPlayer} = component

		// If opponent gave boss any extra cards on turn 1, remove all of them
		game.components
			.filter(
				CardComponent,
				query.card.currentPlayer,
				query.not(query.card.onBoard),
			)
			.forEach((card) => game.components.delete(card.entity))

		// Let boss use secondary attack in case opponent blocks primary or uses Mining Fatigue
		observer.subscribe(player.hooks.availableEnergy, (availableEnergy) => {
			return availableEnergy.length
				? availableEnergy
				: ['balanced', 'balanced', 'balanced']
		})

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.HERMIT_APPLY_ATTACK,
			(attack) => {
				if (!attack.isAttacker(component.entity)) return
				if (attack.type !== 'primary' && attack.type !== 'secondary') return

				const bossAttack = bossAttacks.get(component)

				if (bossAttack[1] !== undefined) {
					switch (bossAttack[1]) {
						case 'HEAL150':
							// Heal for 150 damage
							if (component.slot.inRow()) component.slot.row.heal(150)
							break
						case 'ABLAZE':
							// Set opponent ablaze
							if (damageDisabled.get(component)) break
							const opponentActiveHermit = game.components.findEntity(
								CardComponent,
								query.card.isHermit,
								query.card.row(query.row.active),
							)
							if (opponentActiveHermit)
								game.components
									.new(StatusEffectComponent, FireEffect, component.entity)
									.apply(opponentActiveHermit)
							break
					}
				}

				damageDisabled.clear(component)
			},
		)

		observer.subscribeWithPriority(
			opponentPlayer.hooks.afterApply,
			afterApply.CLEAR_STATUS_EFFECT,
			() => {
				removeImmuneEffects(game, component.slot)
			},
		)

		let lastAttackDisabledByAmnesia: number | null = null
		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.EFFECT_REMOVE_STATUS,
			(attack) => {
				if (attack.player.entity === player.entity) return
				removeImmuneEffects(game, component.slot)
				// Prevent Grand Architect's "Amnesia" disabling boss damage consecutively
				const amnesiaEffect = game.components.find(
					StatusEffectComponent<CardComponent>,
					query.effect.targetEntity(component.entity),
					query.effect.is(
						PrimaryAttackDisabledEffect,
						SecondaryAttackDisabledEffect,
					),
				)
				if (lastAttackDisabledByAmnesia === game.state.turn.turnNumber - 2) {
					if (amnesiaEffect) amnesiaEffect.remove()
				} else if (
					amnesiaEffect &&
					game.currentPlayerEntity === opponentPlayer.entity
				) {
					lastAttackDisabledByAmnesia = game.state.turn.turnNumber
				}
			},
		)

		// Boss manually updates lives so it doesn't leave the board and trigger an early end
		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.BOSS_HANDLE_KNOCKOUT,
			(attack) => {
				if (!attack.isTargeting(component)) return
				if (
					!component.slot.inRow() ||
					component.slot.row.health === null ||
					component.slot.row.health > 0
				)
					return

				if (player.lives > 1) {
					game.battleLog.addDeathEntry(player.entity, component.slot.row.entity)

					component.slot.row.health = 300
					player.lives -= 1

					// Reward card
					opponentPlayer.draw(1)

					game.components
						.filter(
							StatusEffectComponent,
							query.effect.is(
								SculkCatalystTriggeredEffect,
								TFCDiscardedFromEffect,
							),
							query.effect.targetEntity(component.entity),
						)
						.forEach((effect) => effect.remove())
				} else {
					observer.unsubscribe(game.hooks.afterAttack)
				}
			},
		)
	},
}

export default NewBoss
export {supplyBossAttack}
export type {BOSS_ATTACK} 