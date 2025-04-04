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
import EvilXisumaRare from '../../hermits/evilxisuma-rare'
import {Hermit} from '../../types'

type PRIMARY_ATTACK = '50DMG' | '70DMG' | '90DMG'
type SECONDARY_ATTACK = 'HEAL150' | 'ABLAZE' | 'DOUBLE'
type TERTIARY_ATTACK = 'EFFECTCARD' | 'AFK20' | 'ITEMCARD'

export type BOSS_ATTACK = [PRIMARY_ATTACK, SECONDARY_ATTACK?, TERTIARY_ATTACK?]

const bossAttacks = new InstancedValue<BOSS_ATTACK>(() => ['50DMG'])

export const supplyBossAttack = (
	component: CardComponent,
	value: BOSS_ATTACK,
) => bossAttacks.set(component, value)

const attackLog = (
	bossAttack: BOSS_ATTACK,
): ((values: AttackLog) => string) | undefined => {
	let attackName: string
	if (bossAttack.length === 1) attackName = `$v${bossAttack[0]}$`
	else {
		const items = bossAttack.map((attack) => `$v${attack}$`)
		const last = items.pop()
		attackName = items.join(', ') + ' and ' + last
	}

	const baseLog = (values: AttackLog) =>
		`${values.attacker} attacked ${values.target} with ${attackName} for ${values.damage} damage`
	let footer: string
	switch (bossAttack[2]) {
		case 'ITEMCARD':
			footer = ' and forced {them|you} to discard an attached item card'
			break
		case 'EFFECTCARD':
			footer = " and discarded {their|your} active's attached effect card"
			break
		case 'AFK20':
			footer = ' and attacked all {their|your} AFK hermits'
			break
		default:
			footer = ''
	}

	switch (bossAttack[1]) {
		case 'HEAL150':
			return (values) =>
				baseLog(values) +
				`${footer ? ',' : ' and'} healed for $g150hp$${footer}`
		case 'ABLAZE':
			return (values) =>
				baseLog(values) +
				`${footer ? ',' : ' and'} set {${values.opponent}'s|your} active hermit $bablaze$${footer}`
		case 'DOUBLE':
			return (values) => baseLog(values) + footer
	}
	return baseLog
}

const effectDiscardCondition = query.card.slot(
	query.slot.opponent,
	query.slot.active,
	query.slot.attach,
	query.not(query.slot.frozen),
)

/** EX is immune to poison, fire, and slowness */
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

function destroyCard(game: GameModel, card: CardComponent) {
	game.components.delete(card.slotEntity)
	game.components.delete(card.entity)
}

/** Determines whether the player attempting to use this is the boss */
function isBeingMocked(game: GameModel, component: CardComponent) {
	return (
		game.components.filter(
			RowComponent,
			query.row.player(component.slot.player.entity),
		).length !== 1
	)
}

const damageDisabled = new InstancedValue<boolean>(() => false)

const EvilXisumaBoss: Hermit = {
	...EvilXisumaRare,
	id: 'evilxisuma_boss',
	numericId: -1,
	expansion: 'boss',
	health: 300,

	getAttack(
		game: GameModel,
		component: CardComponent,
		hermitAttackType: HermitAttackType,
	) {
		// Players who imitate this card should use regular attacks and not the boss'
		if (isBeingMocked(game, component)) {
			return EvilXisumaRare.getAttack(game, component, hermitAttackType)
		}

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
			// Remove effect card before attack is executed to mimic Curse of Vanishing
			game.components.find(CardComponent, effectDiscardCondition)?.discard()
		}

		// If the opponent blocks EX's "attack", then EX can not deal damage or set opponent on fire
		if (disabled) {
			attack.multiplyDamage(component.entity, 0).lockDamage(component.entity)
		} else {
			if (bossAttack[1] === 'DOUBLE') attack.multiplyDamage(component.entity, 2)

			if (bossAttack[2] === 'AFK20') {
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
		if (isBeingMocked(game, component)) {
			EvilXisumaRare.onAttach(game, component, observer)
			return
		}

		// Apply an ailment to act on EX's ninth turn
		game.components
			.new(StatusEffectComponent, ExBossNineEffect, component.entity)
			.apply(component.entity)

		const {player, opponentPlayer} = component

		// If opponent gave EX any extra cards on turn 1, remove all of them
		game.components
			.filter(
				CardComponent,
				query.card.currentPlayer,
				query.not(query.card.onBoard),
			)
			.forEach((card) => destroyCard(game, card))

		// Let EX use secondary attack in case opponent blocks primary or uses Mining Fatigue
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
			game.hooks.afterAttack,
			afterAttack.HERMIT_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isAttacker(component.entity)) return
				if (attack.type !== 'primary' && attack.type !== 'secondary') return

				const bossAttack = bossAttacks.get(component)
				if (bossAttack[2] === 'ITEMCARD') {
					// Remove an item card attached to the opponent's active Hermit
					const pickCondition = query.every(
						query.slot.opponent,
						query.slot.active,
						query.slot.item,
						query.not(query.slot.empty),
						query.not(query.slot.frozen),
						(_game, slot) => slot.card?.isItem() === true,
					)
					if (
						opponentPlayer.activeRow?.health &&
						game.components.exists(SlotComponent, pickCondition)
					) {
						game.addPickRequest({
							player: opponentPlayer.entity,
							id: component.entity,
							message: 'Choose an item to discard from your active Hermit.',
							canPick: pickCondition,
							onResult(pickedSlot) {
								if (!pickedSlot.inRow()) return

								const playerRow = pickedSlot.row

								const hermitCard = playerRow.getHermit()
								if (!hermitCard || !playerRow.health) return

								const card = pickedSlot.card
								if (!card || !card.isItem()) return

								card.discard()

								return 'SUCCESS'
							},
							onTimeout() {
								// Discard the first available item card
								game.components
									.find(CardComponent, query.card.slot(pickCondition))
									?.discard()
							},
						})
					}
				}
				bossAttacks.clear(component)
			},
		)

		observer.subscribeWithPriority(
			opponentPlayer.hooks.afterApply,
			afterApply.CLEAR_STATUS_EFFECT,
			() => {
				// If opponent plays Dropper, remove the Fletching Tables added to the draw pile
				game.components
					.filter(
						CardComponent,
						query.card.opponentPlayer,
						query.card.slot(query.slot.deck),
					)
					.forEach((card) => destroyCard(game, card))
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
				// Evil Xisuma's "Derp Coin" disables after a modal request, so this shouldn't nerf consecutive heads
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

		// EX manually updates lives so it doesn't leave the board and trigger an early end
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
					// TODO: Death entry appears in log before the attack entry
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

export default EvilXisumaBoss
