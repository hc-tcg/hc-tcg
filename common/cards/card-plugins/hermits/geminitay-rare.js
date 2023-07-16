import HermitCard from './_hermit-card'
import {discardSingleUse} from '../../../../server/utils'
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
				power: 'You may play an additional single use effect card at the end of your turn.',
			},
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onAttach(game, instance, pos) {
		const {player} = pos
		const extraCardKey = this.getInstanceKey(instance, 'extraCard')

		// @TODO egg confusion, and how can we get rid of follow up
		// is that even in the scope of this refactor?
		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance) || attack.type !== 'secondary') return

			// To keep this simple gem will discard the single use card, if it's used
			if (player.board.singleUseCardUsed) {
				discardSingleUse(game, player)
			}

			// Set flag, so we can modify available actions
			player.custom[extraCardKey] = true
		})

		player.hooks.availableActions.add(instance, (availableActions) => {
			// if the flag is enabled allow playing another card
			// @TODO what does follow up do with this
			if (player.custom[extraCardKey]) {
				if (!availableActions.includes('PLAY_SINGLE_USE_CARD') && !player.board.singleUseCard) {
					availableActions.push('PLAY_SINGLE_USE_CARD')
				}
				if (!availableActions.includes('ZERO_ATTACK')) {
					availableActions.push('ZERO_ATTACK')
				}
			}

			return availableActions
		})

		player.hooks.onApply.add(instance, (pickedSlots, modalResult) => {
			if (!player.board.singleUseCard && player.custom[extraCardKey]) {
				// Trident was here and it's no longer here
				delete player.custom[extraCardKey]
			}
		})

		player.hooks.afterApply.add(instance, (pickedSlots, modalResult) => {
			// Piston/Fire Charge won't be here.
			// If a card is till here we need to remove the flag
			if (player.board.singleUseCard && player.custom[extraCardKey]) {
				delete player.custom[extraCardKey]
			}
		})

		player.hooks.onTurnEnd.add(instance, () => {
			delete player.custom[extraCardKey]
		})
	}

	/**
	 * @param {GameModel} game
	 * @param {string} instance
	 * @param {import('../../../types/cards').CardPos} pos
	 */
	onDetach(game, instance, pos) {
		const {player} = pos
		const extraCardKey = this.getInstanceKey(instance, 'extraCard')

		// Remove hooks and flags
		player.hooks.afterAttack.remove(instance)
		player.hooks.availableActions.remove(instance)
		player.hooks.onApply.remove(instance)
		player.hooks.afterApply.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
		delete player.custom[extraCardKey]
	}
}

export default GeminiTayRareHermitCard
