import HermitCard from './_hermit-card'
import {HERMIT_CARDS, ITEM_CARDS} from '../..'
import {GameModel} from '../../../../server/models/game-model'
import {CardPos} from '../../../../server/models/card-pos-model'
import {flipCoin} from '../../../../server/utils'
import {AttackModel} from '../../../../server/models/attack-model'
import {getNonEmptyRows, hasEnoughEnergy, getActiveRowPos} from '../../../../server/utils'
import {createWeaknessAttack} from '../../../../server/utils/attacks'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */
class HumanCleoRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'humancleo_rare',
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

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos
		const instanceKey = this.getInstanceKey(instance)

		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== instanceKey || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, this.id, 2)
			player.coinFlips[this.id] = coinFlip

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			if (headsAmount < 2) return

			player.custom['opponent-attack'] = {
				cardId: this.id,
				name: this.name,
				pickReqs: [{target: 'player', type: ['hermit'], amount: 1, active: false}],
			}
			player.custom[instance] = true

			opponentPlayer.hooks.beforeAttack[instance] = (attack, pickedSlots) => {
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
				delete opponentPlayer.hooks.beforeAttack[instance]
			}

			opponentPlayer.hooks.onTurnTimeout[instance] = (newAttacks) => {
				if (!player.custom[instance]) return
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
				if (!opponentActiveRow?.row.hermitCard) return

				const activeHermitInfo = HERMIT_CARDS[opponentActiveRow.row.hermitCard.cardId]

				const itemCards = opponentActiveRow.row.itemCards
				const energyTypes = []
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
				delete opponentPlayer.hooks.beforeAttack[instance]
			}

			opponentPlayer.hooks.onAttack[instance] = (attack) => {
				if (
					player.custom[instance] &&
					attack.isType('weakness') &&
					attack.target?.player === player &&
					attack.target.rowIndex === player.board.activeRow
				) {
					attack.target = null
				}
				delete opponentPlayer.hooks.blockedActions[instance]
			}

			opponentPlayer.hooks.blockedActions[instance] = (blockedActions) => {
				if (!player.custom[instance]) return blockedActions

				const opponentActiveRow = getActiveRowPos(opponentPlayer)
				const opponentInactiveRows = getNonEmptyRows(opponentPlayer, false)

				if (!opponentActiveRow || opponentInactiveRows.length === 0) return blockedActions
				if (!opponentActiveRow.row.hermitCard) return blockedActions

				blockedActions.push('CHANGE_ACTIVE_HERMIT')

				const itemCards = opponentActiveRow.row.itemCards
				const energyTypes = []
				itemCards.forEach((item) => {
					if (!item || !item.cardId) return blockedActions
					energyTypes.push(ITEM_CARDS[item.cardId].hermitType)
				})

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
			}
		}

		opponentPlayer.hooks.onTurnEnd[instance] = () => {
			delete opponentPlayer.hooks.blockedActions[instance]
			delete opponentPlayer.hooks.beforeAttack[instance]
			delete opponentPlayer.hooks.onTurnEnd[instance]
			delete opponentPlayer.hooks.onTurnTimeout[instance]
			delete player.custom['opponent-attack']
			delete player.custom[instance]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete opponentPlayer.hooks.blockedActions[instance]
		delete opponentPlayer.hooks.beforeAttack[instance]
		delete opponentPlayer.hooks.onTurnEnd[instance]
		delete opponentPlayer.hooks.onTurnTimeout[instance]
		delete player.custom['opponent-attack']
		delete player.custom[instance]
	}

	getExpansion() {
		return 'alter_egos'
	}

	getPalette() {
		return 'alter_egos'
	}

	getBackground() {
		return 'alter_egos_background'
	}
}

export default HumanCleoRareHermitCard
