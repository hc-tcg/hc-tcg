import HermitCard from '../base/hermit-card'
import {HERMIT_CARDS, ITEM_CARDS} from '..'
import {GameModel} from '../../models/game-model'
import {CardPosModel} from '../../models/card-pos-model'
import {flipCoin} from '../../utils/coinFlips'
import {getActiveRowPos, getNonEmptyRows} from '../../utils/board'
import {createWeaknessAttack, hasEnoughEnergy} from '../../utils/attacks'
import {AttackModel} from '../../models/attack-model'
import {HermitTypeT} from '../../types/cards'

class HumanCleoRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'humancleo_rare',
			numericId: 132,
			name: 'Human Cleo',
			rarity: 'rare',
			hermitType: 'pvp',
			health: 270,
			primary: {
				name: 'Humanity',
				cost: ['pvp'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Betrayed',
				cost: ['pvp', 'pvp'],
				damage: 70,
				power:
					'Flip a coin, twice. If both are heads, your opponent must attack one of their own AFK Hermits on their next turn. Opponent must have necessary item cards attached to execute an attack.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, this.id, 2)

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			if (headsAmount < 2) return

			player.custom['opponent-attack'] = {
				cardId: this.id,
				name: this.name,
				pickReqs: [{target: 'player', slot: ['hermit'], amount: 1, active: false}],
			}
			player.custom[instanceKey] = true

			opponentPlayer.hooks.beforeAttack.add(instance, (attack, pickedSlots) => {
				const opponentInactiveRows = getNonEmptyRows(opponentPlayer, false)

				if (opponentInactiveRows.length === 0) return
				if (!attack.isType('primary', 'secondary')) return

				const slot = pickedSlots[this.id][0]
				if (!slot || !slot.row || !slot.row.state.hermitCard) return
				attack.target = {
					player: opponentPlayer,
					row: slot.row.state,
					rowIndex: slot.row.index,
				}

				const weaknessAttack = createWeaknessAttack(attack)
				if (weaknessAttack) attack.addNewAttack(weaknessAttack)

				delete player.custom['opponent-attack']
				opponentPlayer.hooks.beforeAttack.remove(instance)
			})

			opponentPlayer.hooks.onTurnTimeout.add(instance, (newAttacks) => {
				if (!player.custom[instanceKey]) return
				const opponentInactiveRows = getNonEmptyRows(opponentPlayer, false)
				const activeRow = getActiveRowPos(player)
				if (!activeRow?.row.hermitCard) return

				if (opponentInactiveRows.length === 0) return

				const newAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'newAttack'),
					attacker: {
						player: player,
						rowIndex: activeRow.rowIndex,
						row: activeRow.row,
					},
					target: opponentInactiveRows[0],
					type: 'primary',
				})

				const opponentActiveRow = getActiveRowPos(opponentPlayer)
				if (!opponentActiveRow?.row?.hermitCard) return

				const activeHermitInfo = HERMIT_CARDS[opponentActiveRow.row.hermitCard.cardId]
				if (!activeHermitInfo) return

				const itemCards = opponentActiveRow.row.itemCards
				const energyTypes: Array<HermitTypeT> = []
				itemCards.forEach((item) => {
					if (!item || !item.cardId) return
					energyTypes.push(ITEM_CARDS[item.cardId].hermitType)
				})

				if (hasEnoughEnergy(energyTypes, activeHermitInfo.secondary.cost)) {
					newAttack.type = 'secondary'
					newAttack.addDamage(this.id, activeHermitInfo.secondary.damage)
				} else if (hasEnoughEnergy(energyTypes, activeHermitInfo.primary.cost)) {
					newAttack.type = 'primary'
					newAttack.addDamage(this.id, activeHermitInfo.primary.damage)
				} else {
					return
				}

				newAttacks.push(newAttack)

				const weaknessAttack = createWeaknessAttack(attack)
				if (weaknessAttack) newAttacks.push(weaknessAttack)

				delete player.custom['opponent-attack']
				opponentPlayer.hooks.beforeAttack.remove(instance)
			})

			opponentPlayer.hooks.onAttack.add(instance, (attack) => {
				if (
					player.custom[instanceKey] &&
					attack.isType('weakness') &&
					attack.target?.player === player &&
					attack.target.rowIndex === player.board.activeRow
				) {
					attack.target = null
				}
				opponentPlayer.hooks.blockedActions.remove(instance)
			})

			opponentPlayer.hooks.blockedActions.add(instance, (blockedActions) => {
				if (!player.custom[instanceKey]) return blockedActions

				const opponentActiveRow = getActiveRowPos(opponentPlayer)
				const opponentInactiveRows = getNonEmptyRows(opponentPlayer, false)

				if (!opponentActiveRow || opponentInactiveRows.length === 0) return blockedActions
				if (!opponentActiveRow.row.hermitCard) return blockedActions

				blockedActions.push('CHANGE_ACTIVE_HERMIT')

				const itemCards = opponentActiveRow.row.itemCards
				const energyTypes: Array<HermitTypeT> = []
				itemCards.forEach((item) => {
					if (!item || !item.cardId) return blockedActions
					energyTypes.push(ITEM_CARDS[item.cardId].hermitType)
				})

				if (!opponentActiveRow?.row?.hermitCard) return blockedActions
				const activeHermitInfo = HERMIT_CARDS[opponentActiveRow.row.hermitCard.cardId]

				const isSleeping = opponentActiveRow.row.ailments.some((a) => a.id === 'sleeping')
				if (isSleeping) return blockedActions

				if (
					!hasEnoughEnergy(energyTypes, activeHermitInfo.primary.cost) &&
					!hasEnoughEnergy(energyTypes, activeHermitInfo.secondary.cost)
				) {
					return blockedActions
				}

				blockedActions.push('END_TURN')

				return blockedActions
			})

			opponentPlayer.hooks.onTurnEnd.add(instance, () => {
				opponentPlayer.hooks.blockedActions.remove(instance)
				opponentPlayer.hooks.beforeAttack.remove(instance)
				opponentPlayer.hooks.onTurnEnd.remove(instance)
				opponentPlayer.hooks.onTurnTimeout.remove(instance)
				delete player.custom['opponent-attack']
				delete player.custom[this.getInstanceKey(instance)]
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		// Remove hooks
		opponentPlayer.hooks.onAttack.remove(instance)
		opponentPlayer.hooks.blockedActions.remove(instance)
		opponentPlayer.hooks.beforeAttack.remove(instance)
		opponentPlayer.hooks.onTurnTimeout.remove(instance)
		delete player.custom['opponent-attack']
		delete player.custom[this.getInstanceKey(instance)]
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default HumanCleoRareHermitCard
