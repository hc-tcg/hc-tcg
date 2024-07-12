import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
import {AttackLog, HermitAttackType} from '../../../types/attack'
import {CardInstance} from '../../../types/game-state'
import {applyStatusEffect, getActiveRow, removeStatusEffect} from '../../../utils/board'
import {discardCard} from '../../../utils/movement'
import EvilXisumaRareHermitCard from '../../alter-egos/hermits/evilxisuma_rare'
import {InstancedValue} from '../../base/card'

type PRIMARY_ATTACK = '50DMG' | '70DMG' | '90DMG'
type SECONDARY_ATTACK = 'HEAL150' | 'ABLAZE' | 'DOUBLE'
type TERTIARY_ATTACK = 'EFFECTCARD' | 'AFK20' | 'ITEMCARD'

export type BOSS_ATTACK = [PRIMARY_ATTACK, SECONDARY_ATTACK?, TERTIARY_ATTACK?]

const bossAttacks = new InstancedValue<BOSS_ATTACK>(() => ['50DMG'])

export const supplyBossAttack = (instance: CardInstance, value: BOSS_ATTACK) =>
	bossAttacks.set(instance, value)

const attackLog = (bossAttack: BOSS_ATTACK): ((values: AttackLog) => string) | undefined => {
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
			return (values) => baseLog(values) + `${footer ? ',' : ' and'} healed for $g150hp$${footer}`
		case 'ABLAZE':
			return (values) =>
				baseLog(values) +
				`${footer ? ',' : ' and'} set {${values.opponent}'s|your} active hermit $bablaze$${footer}`
		case 'DOUBLE':
			return (values) => baseLog(values) + footer
	}
	return baseLog
}

const effectDiscardCondition = slot.every(
	slot.opponent,
	slot.activeRow,
	slot.attachSlot,
	slot.not(slot.empty),
	slot.not(slot.frozen)
)

class EvilXisumaBossHermitCard extends EvilXisumaRareHermitCard {
	constructor() {
		super()
		this.props.id = 'evilxisuma_boss'
		this.props.expansion = 'boss'
		this.props.health = 300
	}

	/** Determines whether the player attempting to use this is the boss */
	private isBeingImitated(pos: CardPosModel) {
		return pos.player.board.rows.length !== 1
	}

	disabled = new InstancedValue<boolean>(() => false)

	override getAttack(
		game: GameModel,
		instance: CardInstance,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		// Players who imitate this card should use regular attacks and not the boss'
		if (this.isBeingImitated(pos)) {
			return super.getAttack(game, instance, pos, hermitAttackType)
		}

		if (pos.rowIndex === null || !pos.row || !pos.row.hermitCard) return null

		const {player, row, rowIndex, opponentPlayer} = pos
		const activeIndex = opponentPlayer.board.activeRow
		if (activeIndex === null) return null

		const targetRow = opponentPlayer.board.rows[activeIndex]
		if (!targetRow.hermitCard) return null

		const bossAttack = bossAttacks.get(instance)

		const attacker = {player, rowIndex, row}
		// Create an attack with 0 damage
		const attack = new AttackModel({
			id: this.getInstanceKey(instance),
			attacker,
			target: {
				player: opponentPlayer,
				rowIndex: activeIndex,
				row: targetRow,
			},
			type: hermitAttackType,
			log: attackLog(bossAttack),
		})

		const disabled = game.getAllBlockedActions().some((blockedAction) => {
			return blockedAction == 'PRIMARY_ATTACK' || blockedAction == 'SECONDARY_ATTACK'
		})
		this.disabled.set(instance, disabled)

		if (bossAttack[2] === 'EFFECTCARD') {
			// Remove effect card before attack is executed to mimic Curse of Vanishing
			game
				.filterSlots(effectDiscardCondition)
				.map((slot) => slot.card && discardCard(game, slot.card))
		}

		// If the opponent blocks EX's "attack", then EX can not deal damage or set opponent on fire
		if (disabled) {
			attack.multiplyDamage(this.props.id, 0).lockDamage(this.props.id)
		} else {
			attack.addDamage(this.props.id, Number(bossAttack[0].substring(0, 2)))

			if (bossAttack[1] === 'DOUBLE') attack.multiplyDamage(this.props.id, 2)

			if (bossAttack[2] === 'AFK20') {
				const opponentRows = opponentPlayer.board.rows
				opponentRows.forEach((row, rowIndex) => {
					if (!row || !row.hermitCard) return
					if (rowIndex === activeIndex) return
					const newAttack = new AttackModel({
						id: this.getInstanceKey(instance, 'inactive'),
						attacker,
						target: {
							player: opponentPlayer,
							rowIndex,
							row,
						},
						type: hermitAttackType,
						log: (values) => `, ${values.damage} damage to ${values.target}`,
					}).addDamage(this.props.id, 20)
					attack.addNewAttack(newAttack)
				})
			}
		}

		return attack
	}

	override onAttach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		if (this.isBeingImitated(pos)) {
			super.onAttach(game, instance, pos)
			return
		}

		// Apply an ailment to act on EX's ninth turn
		applyStatusEffect(game, 'exboss-nine', instance)

		const {player, opponentPlayer, row} = pos

		// If opponent gave EX any extra cards on turn 1, remove all of them
		player.hand = []
		player.pile = []

		// Let EX use secondary attack in case opponent blocks primary
		player.hooks.availableEnergy.add(instance, (availableEnergy) => {
			return availableEnergy.length ? availableEnergy : ['balanced', 'balanced']
		})

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'primary' && attack.type !== 'secondary') return

			const bossAttack = bossAttacks.get(instance)

			if (bossAttack[1] !== undefined) {
				const opponentActiveRow = getActiveRow(opponentPlayer)

				switch (bossAttack[1]) {
					case 'HEAL150':
						// Heal for 150 damage
						if (pos.row && pos.row.health) {
							const row = pos.row
							row.health = Math.min(row.health + 150, 300)
						}
						break
					case 'ABLAZE':
						// Set opponent ablaze
						if (opponentActiveRow && opponentActiveRow.hermitCard && !this.disabled.get(instance))
							applyStatusEffect(game, 'fire', opponentActiveRow.hermitCard)
						break
				}
			}

			this.disabled.clear(instance)
		})

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'primary' && attack.type !== 'secondary') return

			const bossAttack = bossAttacks.get(instance)
			if (bossAttack[2] === 'ITEMCARD') {
				// Remove an item card attached to the opponent's active Hermit
				const pickCondition = slot.every(
					slot.opponent,
					slot.activeRow,
					slot.itemSlot,
					slot.not(slot.empty),
					(game, pos) => pos.card?.isItem() === true
				)
				if (getActiveRow(opponentPlayer)?.health && game.someSlotFulfills(pickCondition)) {
					game.addPickRequest({
						playerId: opponentPlayer.id,
						id: this.props.id,
						message: 'Choose an item to discard from your active Hermit.',
						canPick: pickCondition,
						onResult(pickedSlot) {
							if (pickedSlot.rowIndex === null || pickedSlot.card === null) return

							const playerRow = opponentPlayer.board.rows[pickedSlot.rowIndex]

							const hermitCard = playerRow.hermitCard
							if (!hermitCard || !playerRow.health) return

							if (!pickedSlot.card.isItem()) return

							discardCard(game, pickedSlot.card)

							return 'SUCCESS'
						},
						onTimeout() {
							// Discard the first available item card
							const activeRow = getActiveRow(opponentPlayer)
							if (!activeRow) return
							const itemCard = activeRow.itemCards.find((card) => card?.isItem())
							if (!itemCard) return
							discardCard(game, itemCard)
						},
					})
				}
			}
			bossAttacks.clear(instance)
		})

		// EX is immune to poison, fire, and slowness
		const IMMUNE_STATUS_EFFECTS = new Set(['poison', 'fire', 'slowness'])
		opponentPlayer.hooks.afterApply.add(instance, () => {
			// If opponent plays Dropper, remove the Fletching Tables added to the draw pile
			if (player.pile.length) player.pile = []

			if (!row) return
			const ailmentsToRemove = game.state.statusEffects.filter((ail) => {
				return ail.targetInstance === row.hermitCard && IMMUNE_STATUS_EFFECTS.has(ail.props.id)
			})
			ailmentsToRemove.forEach((ail) => {
				removeStatusEffect(game, pos, ail)
			})
		})
		player.hooks.onDefence.add(instance, (_) => {
			if (!row) return
			const statusEffectsToRemove = game.state.statusEffects.filter((ail) => {
				return ail.targetInstance === row.hermitCard && IMMUNE_STATUS_EFFECTS.has(ail.props.id)
			})
			statusEffectsToRemove.forEach((ail) => {
				removeStatusEffect(game, pos, ail)
			})
		})

		// EX manually updates lives so it doesn't leave the board and trigger an early end
		player.hooks.afterDefence.addBefore(instance, () => {
			if (!row || row.health === null || row.health > 0) return

			if (player.lives > 1) {
				// TODO: Death entry appears in log before the attack entry
				game.battleLog.addDeathEntry(player, row)

				row.health = 300
				player.lives -= 1

				const rewardCard = opponentPlayer.pile.shift()
				if (rewardCard) opponentPlayer.hand.push(rewardCard)
			} else {
				player.hooks.afterDefence.remove(instance)
			}
		})
	}

	override onDetach(game: GameModel, instance: CardInstance, pos: CardPosModel) {
		if (this.isBeingImitated(pos)) {
			super.onDetach(game, instance, pos)
			return
		}

		const {player, opponentPlayer} = pos
		player.hooks.availableEnergy.remove(instance)
		player.hooks.onAttack.remove(instance)
		player.hooks.afterAttack.remove(instance)
		opponentPlayer.hooks.afterApply.remove(instance)
		player.hooks.onDefence.remove(instance)
		opponentPlayer.hooks.afterAttack.remove(instance)
	}
}

export default EvilXisumaBossHermitCard
