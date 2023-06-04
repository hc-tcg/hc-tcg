import HermitCard from './_hermit-card'
import {flipCoin, discardSingleUse} from '../../../../server/utils'
import {GameModel} from '../../../../server/models/game-model'

// Because of this card we can't rely elsewhere on the suCard to be in state on turnEnd hook
class GeminiTayRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'geminitay_rare',
			name: 'Gem',
			rarity: 'rare',
			hermitType: 'terraform',
			health: 270,
			primary: {
				name: "It's Fine",
				cost: ['terraform'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Geminislay',
				cost: ['terraform', 'terraform'],
				damage: 80,
				power:
					'You may play an additional single use effect card at the end of your turn.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onAttach(game, instance) {
		const {currentPlayer} = game.ds
		const extraCardKey = this.getInstanceKey(instance, 'extraCard')

		// @TODO egg confusion, and how can we get rid of follow up
		// is that even in the scope of this refactor?
		currentPlayer.hooks.afterAttack[instance] = (result) => {
			const attack = result.attack
			if (attack.id !== this.id || attack.type !== 'secondary') return

			// To keep this simple gem will discard the single use card, if it's used
			if (currentPlayer.board.singleUseCardUsed) {
				discardSingleUse(game, currentPlayer)
			}

			// Set flag, so we can modify available actions
			currentPlayer.custom[extraCardKey] = true
		}

		currentPlayer.hooks.availableActions[instance] = (availableActions) => {
			// if the flag is enabled allow playing another card
			// @TODO what does follow up do with this
			if (currentPlayer.custom[extraCardKey]) {
				if (
					!availableActions.includes('PLAY_SINGLE_USE_CARD') &&
					!currentPlayer.board.singleUseCard
				) {
					availableActions.push('PLAY_SINGLE_USE_CARD')
				}
				if (!availableActions.includes('ZERO_ATTACK')) {
					availableActions.push('ZERO_ATTACK')
				}
			}

			return availableActions
		}

		currentPlayer.hooks.onApply[instance] = (instance) => {
			// delete flag after single use is applied
			if (currentPlayer.custom[extraCardKey]) {
				delete currentPlayer.custom[extraCardKey]
			}
		}

		currentPlayer.hooks.turnEnd[instance] = () => {
			// delete flag on turn end
			if (currentPlayer.custom[extraCardKey]) {
				delete currentPlayer.custom[extraCardKey]
			}
		}
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 */
	onDetach(game, instance) {
		const {currentPlayer} = game.ds
		const extraCardKey = this.getInstanceKey(instance, 'extraCard')

		// Remove hooks and flags
		delete currentPlayer.hooks.onAttack[instance]
		delete currentPlayer.hooks.availableActions[instance]
		delete currentPlayer.hooks.onApply[instance]
		delete currentPlayer.hooks.turnEnd[instance]
		delete currentPlayer.custom[extraCardKey]
	}
}

export default GeminiTayRareHermitCard
