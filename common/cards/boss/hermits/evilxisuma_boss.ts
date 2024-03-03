import {CARDS, HERMIT_CARDS, ITEM_CARDS} from '../..'
import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {HermitAttackType} from '../../../types/attack'
import {PickRequest} from '../../../types/server-requests'
import {createWeaknessAttack} from '../../../utils/attacks'
import {applyStatusEffect, getActiveRow, removeStatusEffect} from '../../../utils/board'
import {isRemovable} from '../../../utils/cards'
import {discardCard} from '../../../utils/movement'
import HermitCard from '../../base/hermit-card'

class EvilXisumaBossHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'evilxisuma_boss',
			numericId: 128,
			name: 'Evil X',
			rarity: 'rare',
			hermitType: 'balanced',
			health: 300,
			primary: {
				name: 'Evil Inside',
				cost: [],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'Derpcoin',
				cost: ['balanced', 'balanced'],
				damage: 80,
				power:
					"Flip a coin.\n\nIf heads, choose one of the opposing active Hermit's attacks to disable on their next turn.",
			},
		})
	}

	private fireDropper() {
		return Math.floor(Math.random() * 9)
	}

	/** Determines whether the player attempting to use this is the boss */
	private isBeingImitated(pos: CardPosModel) {
		return pos.player.board.rows.length !== 1
	}

	override getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	): AttackModel[] {
		// Players who imitate this card should use "evilxisuma_rare" attacks and not the boss'
		if (this.isBeingImitated(pos)) {
			return HERMIT_CARDS['evilxisuma_rare'].getAttacks(game, instance, pos, hermitAttackType)
		}

		if (pos.rowIndex === null || !pos.row || !pos.row.hermitCard) return []

		const {player, row, rowIndex, opponentPlayer} = pos
		const targetIndex = opponentPlayer.board.activeRow
		if (targetIndex === null) return []

		const targetRow = opponentPlayer.board.rows[targetIndex]
		if (!targetRow.hermitCard) return []

		// Create an attack with 0 damage
		const attack = new AttackModel({
			id: this.getInstanceKey(instance),
			attacker: {
				player,
				rowIndex,
				row,
			},
			target: {
				player: opponentPlayer,
				rowIndex: targetIndex,
				row: targetRow,
			},
			type: hermitAttackType,
		})

		const attacks = [attack]

		const rngKey = this.getInstanceKey(instance, 'rng')

		const attackDefs: {
			damage: number
			secondary?: number
			tertiary?: number
			disabled: boolean
		} = {
			damage: this.fireDropper(),
			disabled: game.getAllBlockedActions().some((blockedAction) => {
				return blockedAction == 'PRIMARY_ATTACK' || blockedAction == 'SECONDARY_ATTACK'
			}),
		}

		const lives = pos.player.lives

		if (lives == 3) {
			attackDefs.damage = [0, 0, 1, 1, 1, 2, 2, 2, 2][attackDefs.damage]
		} else {
			let secondaryIndex = this.fireDropper()
			if (lives == 2) {
				attackDefs.damage = [0, 0, 0, 1, 1, 1, 2, 2, 2][attackDefs.damage]
				attackDefs.secondary = [0, 0, 0, 1, 1, 1, 2, 2, 2][secondaryIndex]
			} else {
				attackDefs.damage = [0, 0, 0, 0, 1, 1, 1, 2, 2][attackDefs.damage]
				attackDefs.secondary = [0, 0, 0, 0, 1, 1, 1, 2, 2][secondaryIndex]
				attackDefs.tertiary = [0, 0, 0, 0, 1, 1, 1, 2, 2][this.fireDropper()]

				if (attackDefs.tertiary === 0) {
					// Remove effect card before attack is executed to mimic Curse of Vanishing
					if (targetRow.effectCard && isRemovable(targetRow.effectCard))
						discardCard(game, targetRow.effectCard)
				}
			}
		}
		attackDefs.damage = [50, 70, 90][attackDefs.damage]

		// If the opponent blocks EX's "attack", then EX can not deal damage or set opponent on fire
		if (!attackDefs.disabled) {
			attack.addDamage(this.id, attackDefs.damage)

			if (attack.isType('primary', 'secondary')) {
				const weaknessAttack = createWeaknessAttack(attack)
				if (weaknessAttack) attacks.push(weaknessAttack)
			}

			if (attackDefs.tertiary === 1) {
				const opponentRows = opponentPlayer.board.rows
				for (let i = 0; i < opponentRows.length; i++) {
					const opponentRow = opponentRows[i]
					if (!opponentRow || !opponentRow.hermitCard || i == opponentPlayer.board.activeRow)
						continue
					const newAttack = new AttackModel({
						id: this.getInstanceKey(instance, 'inactive'),
						attacker: {player, rowIndex, row},
						target: {
							player: opponentPlayer,
							rowIndex: i,
							row: opponentRow,
						},
						type: hermitAttackType,
					}).addDamage(this.id, 20)
					attacks.push(newAttack)
				}
			}
		}

		pos.player.custom[rngKey] = attackDefs

		return attacks
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		if (this.isBeingImitated(pos)) {
			HERMIT_CARDS['evilxisuma_rare'].onAttach(game, instance, pos)
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

		const rngKey = this.getInstanceKey(instance, 'rng')
		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'primary' && attack.type !== 'secondary') return

			const attackDefs: {
				damage: number
				secondary?: number
				tertiary?: number
				disabled: boolean
			} = player.custom[rngKey]

			const voiceLines: string[] = []

			if (attackDefs.secondary !== undefined) {
				const opponentActiveRow = getActiveRow(opponentPlayer)

				switch (attackDefs.tertiary) {
					case 0:
						// Remove the effect attached to opponent's active Hermit
						// This is done in getAttacks() to imitate playing Curse of Vanishing
						voiceLines.push('EFFECTCARD')
						break
					case 1:
						// Deal 20 DMG to each AFK Hermit
						voiceLines.push('AFK20')
						break
					case 2:
						// Remove an item card attached to the opponent's active Hermit
						voiceLines.push('ITEMCARD')
						if (
							opponentActiveRow &&
							opponentActiveRow.itemCards.find((card) => card && CARDS[card.cardId]?.type == 'item')
						) {
							const pickRequest: PickRequest = {
								playerId: opponentPlayer.id,
								id: this.id,
								message: 'Choose an item to discard from your active Hermit.',
								onResult(pickResult) {
									if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_WRONG_PLAYER'

									const rowIndex = pickResult.rowIndex
									if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
									if (rowIndex !== opponentPlayer.board.activeRow) return 'FAILURE_INVALID_SLOT'

									if (pickResult.slot.type !== 'item') return 'FAILURE_INVALID_SLOT'
									if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

									const itemCard = ITEM_CARDS[pickResult.card.cardId]
									if (!itemCard) return 'FAILURE_INVALID_SLOT'

									discardCard(game, pickResult.card)

									return 'SUCCESS'
								},
								onTimeout() {
									// Discard the first available item card
									const activeRow = getActiveRow(opponentPlayer)
									if (!activeRow) return
									const itemCard = activeRow.itemCards.find((card) => !!card)
									if (!itemCard) return
									discardCard(game, itemCard)
								},
							}

							// If opponent is knocked out by this attack, the pickRequest should not be added
							player.hooks.afterAttack.add(instance, (attack) => {
								if (opponentActiveRow.health) game.addPickRequest(pickRequest)
								player.hooks.afterAttack.remove(instance)
							})
						}
						break
				}

				switch (attackDefs.secondary) {
					case 0:
						// Heal for 150 damage
						voiceLines.unshift('HEAL150')
						if (pos.row && pos.row.health) {
							const row = pos.row
							row.health = Math.min(row.health + 150, 300)
						}
						break
					case 1:
						// Set opponent ablaze
						voiceLines.unshift('ABLAZE')
						if (opponentActiveRow && opponentActiveRow.hermitCard && !attackDefs.disabled)
							applyStatusEffect(game, 'fire', opponentActiveRow.hermitCard.cardInstance)
						break
					case 2:
						// Deal double damage
						voiceLines.unshift('DOUBLE')
						attack.multiplyDamage(this.id, 2)
						break
				}
			}
			voiceLines.unshift(`${attackDefs.damage}DMG`)

			delete player.custom[rngKey]
			player.custom['VOICE_ANNOUNCE'] = voiceLines
		})

		// EX is immune to poison, fire, and slowness
		const IMMUNE_STATUS_EFFECTS = new Set(['poison', 'fire', 'slowness'])
		opponentPlayer.hooks.afterApply.add(instance, () => {
			// If opponent plays Dropper, remove the Fletching Tables added to the draw pile
			if (player.pile.length) player.pile = []

			if (!row) return
			const ailmentsToRemove = game.state.statusEffects.filter((ail) => {
				return (
					ail.targetInstance === row.hermitCard?.cardInstance &&
					IMMUNE_STATUS_EFFECTS.has(ail.statusEffectId)
				)
			})
			ailmentsToRemove.forEach((ail) => {
				removeStatusEffect(game, pos, ail.statusEffectInstance)
			})
		})
		player.hooks.onDefence.add(instance, (_) => {
			if (!row) return
			const statusEffectsToRemove = game.state.statusEffects.filter((ail) => {
				return (
					ail.targetInstance === row.hermitCard?.cardInstance &&
					IMMUNE_STATUS_EFFECTS.has(ail.statusEffectId)
				)
			})
			statusEffectsToRemove.forEach((ail) => {
				removeStatusEffect(game, pos, ail.statusEffectInstance)
			})
		})

		// EX manually updates lives so it doesn't leave the board and trigger an early end
		player.hooks.afterDefence.addBefore(instance, () => {
			if (!row || row.health === null || row.health > 0) return

			if (player.lives > 1) {
				player.hooks.onHermitDeath.call(pos)

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

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		if (this.isBeingImitated(pos)) {
			HERMIT_CARDS['evilxisuma_rare'].onDetach(game, instance, pos)
			return
		}

		const {player, opponentPlayer} = pos
		player.hooks.availableEnergy.remove(instance)
		player.hooks.onAttack.remove(instance)
		opponentPlayer.hooks.afterApply.remove(instance)
		player.hooks.onDefence.remove(instance)
		opponentPlayer.hooks.afterAttack.remove(instance)
	}

	override getExpansion() {
		return 'boss'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default EvilXisumaBossHermitCard
