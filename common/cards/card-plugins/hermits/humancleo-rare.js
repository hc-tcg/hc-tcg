import HermitCard from './_hermit-card'
import {HERMIT_CARDS, ITEM_CARDS} from '../..'
import {GameModel} from '../../../../server/models/game-model'
import {flipCoin} from '../../../../server/utils'
import {AttackModel} from '../../../../server/models/attack-model'
import {getNonEmptyRows, hasEnoughEnergy} from '../../../../server/utils'

/**
 * @typedef {import('common/types/pick-process').PickRequirmentT} PickRequirmentT
 */

/*
- Has to support having two different afk targets (one for hypno, one for su effect like bow)
- If the afk target for Hypno's ability & e.g. bow are the same, don't apply weakness twice
- TODO - Can't use Got 'Em to attack AFK hermits even with Efficiency if Hypno has no item cards to discard
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
			pickReqs: [
				{target: 'player', type: ['hermit'], amount: 1, active: false},
			],
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player, otherPlayer} = pos

		player.hooks.onAttack[instance] = (attack) => {
			if (
				attack.id !== this.getInstanceKey(instance) ||
				attack.type !== 'secondary'
			)
				return

			const coinFlip = flipCoin(player, this.id, 2)
			player.coinFlips[this.id] = coinFlip

			const headsAmount = coinFlip.filter((flip) => flip === 'heads').length
			if (headsAmount < 2) return

			player.custom[instance] = true

			otherPlayer.hooks.blockedActions[instance] = (blockedActions) => {
				if (!player.custom[instance]) return blockedActions
				const opponentRowIndex = otherPlayer.board.activeRow

				//Remove "Change active hermit", unless you do not have an active Hermit.
				if (opponentRowIndex !== null) {
					blockedActions.push('CHANGE_ACTIVE_HERMIT')
				}
				if (opponentRowIndex === null) return blockedActions

				//If you are not able to attack, you can end your turn.
				const opponentActiveRow = otherPlayer.board.rows[opponentRowIndex]
				if (!opponentActiveRow.hermitCard) return blockedActions

				const itemCards = opponentActiveRow.itemCards
				const energyTypes = []
				itemCards.forEach((item) => {
					if (!item || !item.cardId) return blockedActions
					energyTypes.push(ITEM_CARDS[item.cardId].hermitType)
				})

				const activeHermitInfo =
					HERMIT_CARDS[opponentActiveRow.hermitCard.cardId]

				if (
					hasEnoughEnergy(energyTypes, activeHermitInfo.primary.cost) ||
					hasEnoughEnergy(energyTypes, activeHermitInfo.secondary.cost)
				) {
					blockedActions.push('END_TURN')
				}

				return blockedActions
			}
		}

		otherPlayer.hooks.beforeAttack[instance] = (attack) => {
			const opponentInactiveRows = getNonEmptyRows(otherPlayer, false)
			if (!player.custom[instance] || opponentInactiveRows.length === 0) return

			attack.target = null

			otherPlayer.followUp = this.id

			otherPlayer.hooks.onFollowUp[instance] = (
				followUp,
				pickedSlots,
				newAttacks
			) => {
				if (followUp !== this.id) return
				const slots = pickedSlots[this.id]
				if (!slots || slots.length !== 1) return
				const pickedHermit = slots[0]
				if (!pickedHermit.row || !pickedHermit.row.state.hermitCard) return

				// Create new attack
				const newAttack = new AttackModel({
					id: attack.id,
					target: {
						index: pickedHermit.row.index,
						row: pickedHermit.row.state,
					},
					type: attack.type,
				})
				newAttack.addDamage(attack.damage)
				newAttacks.push(newAttack)

				otherPlayer.followUp = null

				delete otherPlayer.hooks.onFollowUp[instance]
				delete otherPlayer.hooks.onFollowUpTimeout[instance]
			}

			otherPlayer.hooks.onFollowUpTimeout[instance] = (
				followUp,
				newAttacks
			) => {
				if (followUp !== this.id) return

				const attackTarget = opponentInactiveRows[0]

				// Create new attack, but choose the first AFK hermit for the target.
				const newAttack = new AttackModel({
					id: attack.id,
					target: attackTarget,
					type: attack.type,
				})
				newAttack.addDamage(attack.damage)
				newAttacks.push(newAttack)

				otherPlayer.followUp = null

				delete otherPlayer.hooks.onFollowUp[instance]
				delete otherPlayer.hooks.onFollowUpTimeout[instance]
			}

			delete player.custom[instance]
		}

		otherPlayer.hooks.onTurnEnd[instance] = () => {
			delete player.custom[instance]
			delete otherPlayer.hooks.blockedActions[instance]
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player, otherPlayer} = pos

		// Remove hooks
		delete player.hooks.onAttack[instance]
		delete otherPlayer.hooks.beforeAttack[instance]
		delete otherPlayer.hooks.onTurnEnd[instance]
		delete otherPlayer.hooks.blockedActions[instance]
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
