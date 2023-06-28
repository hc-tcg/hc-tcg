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
			pickOn: 'followup',
			pickReqs: [{target: 'player', type: ['hermit'], amount: 1, active: false}],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, opponentPlayer} = pos

		player.hooks.onAttack[instance] = (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, this.id, 2)
			player.coinFlips[this.id] = coinFlip

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			if (headsAmount < 2) return

			player.custom[instance] = true

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
		}

		opponentPlayer.hooks.beforeAttack[instance] = (attack) => {
			const opponentInactiveRows = getNonEmptyRows(opponentPlayer, false)
			if (!player.custom[instance] || opponentInactiveRows.length === 0) return

			if (!attack.isType('effect', 'ailment')) attack.target = null
			if (!attack.isType('primary', 'secondary')) return

			opponentPlayer.followUp = this.id

			opponentPlayer.hooks.onFollowUp[instance] = (followUp, pickedSlots, newAttacks) => {
				if (followUp !== this.id) return
				const slots = pickedSlots[this.id]
				if (!slots || slots.length !== 1) return
				const pickedHermit = slots[0]
				if (!pickedHermit.row || !pickedHermit.row.state.hermitCard) return

				// Create new attack
				const newAttack = new AttackModel({
					id: attack.id,
					attacker: attack.attacker,
					target: {
						player: opponentPlayer,
						rowIndex: pickedHermit.row.index,
						row: pickedHermit.row.state,
					},
					type: 'redirect',
					isBacklash: true,
				})
				newAttack.addDamage(this.id, attack.getDamage())
				newAttacks.push(newAttack)

				const weaknessAttack = createWeaknessAttack(newAttack)
				if (weaknessAttack) newAttacks.push(weaknessAttack)

				opponentPlayer.followUp = null

				delete opponentPlayer.hooks.onFollowUp[instance]
				delete opponentPlayer.hooks.onFollowUpTimeout[instance]
				delete player.custom[instance]
			}

			opponentPlayer.hooks.onFollowUpTimeout[instance] = (followUp, newAttacks) => {
				if (followUp !== this.id) return

				const attackTarget = opponentInactiveRows[0]

				// Create new attack, but choose the first AFK hermit for the target.
				const newAttack = new AttackModel({
					id: attack.id,
					attacker: attack.attacker,
					target: attackTarget,
					type: 'redirect',
					isBacklash: true,
				})
				newAttack.addDamage(this.id, attack.getDamage())
				newAttacks.push(newAttack)

				const weaknessAttack = createWeaknessAttack(attack)
				if (weaknessAttack) newAttacks.push(weaknessAttack)

				opponentPlayer.followUp = null

				delete opponentPlayer.hooks.onFollowUp[instance]
				delete opponentPlayer.hooks.onFollowUpTimeout[instance]
				delete player.custom[instance]
			}
		}

		opponentPlayer.hooks.onTurnEnd[instance] = () => {
			delete player.custom[instance]
			delete opponentPlayer.hooks.blockedActions[instance]
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
		delete opponentPlayer.hooks.blockedActions[instance]
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
