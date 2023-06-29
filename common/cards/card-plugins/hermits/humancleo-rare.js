import HermitCard from './_hermit-card'
import {HERMIT_CARDS, ITEM_CARDS} from '../..'
import {GameModel} from '../../../../server/models/game-model'
import {flipCoin} from '../../../../server/utils'
import {AttackModel} from '../../../../server/models/attack-model'
import {getNonEmptyRows, hasEnoughEnergy} from '../../../../server/utils'
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
	 * @param {import('../../../types/cards').CardPos} pos
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
				const activeRowIndex = player.board.activeRow
				if (!activeRowIndex) return
				const activeRow = player.board.rows[activeRowIndex]
				if (!activeRow.hermitCard) return

				if (opponentInactiveRows.length === 0) return

				const newAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'newAttack'),
					attacker: {
						player: player,
						rowIndex: activeRowIndex,
						row: activeRow,
					},
					target: opponentInactiveRows[0],
					type: 'primary',
				})

				const opponentRowIndex = opponentPlayer.board.activeRow
				if (opponentRowIndex === null) return

				const opponentActiveRow = opponentPlayer.board.rows[opponentRowIndex]
				if (!opponentActiveRow.hermitCard) return

				const activeHermitInfo = HERMIT_CARDS[opponentActiveRow.hermitCard.cardId]

				const itemCards = opponentActiveRow.itemCards
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
				const opponentRowIndex = opponentPlayer.board.activeRow

				//Remove "Change active hermit", unless you do not have an active Hermit.
				if (opponentRowIndex !== null) {
					blockedActions.push('CHANGE_ACTIVE_HERMIT')
				}
				if (opponentRowIndex === null) return blockedActions

				//If you are not able to attack, you can end your turn.
				const opponentActiveRow = opponentPlayer.board.rows[opponentRowIndex]
				if (!opponentActiveRow.hermitCard) return blockedActions

				const itemCards = opponentActiveRow.itemCards
				const energyTypes = []
				itemCards.forEach((item) => {
					if (!item || !item.cardId) return blockedActions
					energyTypes.push(ITEM_CARDS[item.cardId].hermitType)
				})

				const activeHermitInfo = HERMIT_CARDS[opponentActiveRow.hermitCard.cardId]

				if (
					hasEnoughEnergy(energyTypes, activeHermitInfo.primary.cost) ||
					hasEnoughEnergy(energyTypes, activeHermitInfo.secondary.cost)
				) {
					blockedActions.push('END_TURN')
				}

				return blockedActions
			}

			opponentPlayer.hooks.onTurnEnd[instance] = () => {
				delete player.custom[instance]
			}
		}

		opponentPlayer.hooks.onTurnEnd[instance] = () => {
			delete opponentPlayer.hooks.blockedActions[instance]
			delete opponentPlayer.hooks.onTurnEnd[instance]
			delete player.custom['opponent-attack']
			delete player.custom[instance]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete opponentPlayer.hooks.beforeAttack[instance]
		delete opponentPlayer.hooks.onTurnEnd[instance]
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
