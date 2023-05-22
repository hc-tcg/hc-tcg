import Card from '../_card'
import {AttackModel} from '../../../models/attack-model'

/**
 * @typedef {import('common/types/cards').EffectDefs} EffectDefs
 * @typedef {import('common/types/cards').CardTypeT} CardTypeT
 * @typedef {import('models/attack-model').AttackResult} AttackResult
 * @typedef {import('utils').GameModel} GameModel
 */

class EffectCard extends Card {
	/**
	 * @param {EffectDefs} defs
	 */
	constructor({id, name, rarity, description}) {
		super({
			type: 'effect',
			id,
			name,
			rarity,
		})

		if (!description) {
			throw new Error('Invalid card definition!')
		}
		/** @type {string} */
		this.description = description
	}

	/**
	 * @param {GameModel} game
	 * @param {CardPos} pos
	 */
	canAttach(game, pos) {
		const {currentPlayer} = game.ds

		if (pos.slotType !== 'effect') return false
		if (pos.playerId !== currentPlayer.id) return false

		if (!pos.rowState.hermitCard) return false

		return true
	}

	/**
	 * Called during an attack to another row
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackModel} attack
	 * @returns {AttackModel}
	 */
	onAttack(game, instance, attack) {
		// default is do nothing
		return attack
	}

	/**
	 * Called after damage has been applied from attack to another row
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackResult} attackResult
	 */
	afterAttack(game, instance, attackResult) {
		// default is do nothing
	}

	/**
	 * Called during an attack on this row
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackModel} attack
	 * @returns {AttackModel}
	 */
	onDefence(game, instance, attack) {
		// default is do nothing
		return attack
	}

	/**
	 * Called after damage has been applied from attack on this row
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {AttackResult} attackResult
	 */
	afterDefence(game, instance, attackResult) {
		// default is do nothing
	}

	//@TODO we need methods here that cards can do stuff in, but as few as possible
	/*
	available actions?
	*/

	/**
	 * Called at the start of a turn
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onTurnStart(game, instance) {
		// default is do nothing
	}

	/**
	 * Called at the end of a turn
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onTurnEnd(game, instance) {
		// default is do nothing
	}

	/**
	 * Called after the hermit this instance is attached to is dead,
	 * but before the cards are removed from the board
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onHermitDeath(game, instance) {}

	/**
	 * Called before the row is set to inactive
	 * @param {GameModel} game
	 * @param {string} instance
	 * @returns {boolean} Whether this row can become inactive
	 */
	onSetInactive(game, instance) {
		return true
	}

	/**
	 * Called before the row is set to active
	 * @param {GameModel} game
	 * @param {string} instance
	 * @returns {boolean} Whether this row can become active
	 */
	onSetActive(game, instance) {
		return true
	}

	// card picking stuff

	/*
	we need to define when a card should be selected
	*/

	getCardPicks() {
		return {
			selectHermit: {
				/** @type {'attach' | 'apply' | 'beforeAttack' | 'afterAttack'} */
				on: 'attach',
				validatePick: (cardPos) => {
					// validate pick
				},
				onSuccess: (card) => {
					// got the card info, store it someehere for other code to use
				},
			},
		}
	}
}

export default EffectCard
