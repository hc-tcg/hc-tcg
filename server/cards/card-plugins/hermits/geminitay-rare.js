import HermitCard from './_hermit-card'
import {flipCoin, discardSingleUse} from '../../../utils'

// Because of this card we can't rely elsewhere on the suCard to be in state on turnEnd hook
// TODO - this should probably alllow to use two attack single use cards...
// TODO - test with multi step use (looting)
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
					'Flip a Coin.\n\nIf heads, Gem can play an additional effect card the same turn.',
			},
		})
	}

	register(game) {
		game.hooks.attack.tap(this.id, (target, turnAction, derivedState) => {
			const {attackerHermitCard, typeAction, currentPlayer} = derivedState

			if (attackerHermitCard.cardId !== this.id) return target
			if (typeAction !== 'SECONDARY_ATTACK') return target
			if (!target.isActive) return target

			const coinFlip = flipCoin(currentPlayer)
			currentPlayer.coinFlips[this.id] = coinFlip
			if (coinFlip[0] === 'tails') return target

			// special ability is active, set custom value to 1
			// 1 means extra effect is available, 2 means used
			currentPlayer.custom[this.id] = 1

			return target
		})

		// disable gems ability if it's active and an effect card is played
		game.hooks.playCard
			.for('effect')
			.tap(this.id, (turnAction, derivedState) => {
				this.tryDisableAbility(derivedState)
			})
		game.hooks.playCard
			.for('single_use')
			.tap(this.id, (turnAction, derivedState) => {
				this.tryDisableAbility(derivedState)
			})

		// discarding single use cards can only occur after single use card is used up
		game.hooks.actionEnd.tap(this.id, (turnAction, derivedState) => {
			const {currentPlayer} = derivedState

			// if gems ability is active and a single use effect card is used up, remove it
			const abilityActive = currentPlayer.custom[this.id] === 1
			const suUsed = currentPlayer.board.singleUseCardUsed

			if (abilityActive && suUsed && !currentPlayer.followUp) {
				discardSingleUse(game, currentPlayer)
			}
		})

		game.hooks.availableActions.tap(
			this.id,
			(availableActions, derivedState) => {
				const {currentPlayer} = derivedState

				const abilityActive = currentPlayer.custom[this.id] === 1

				if (abilityActive) {
					// make sure both effect cards can be played

					if (
						!currentPlayer.board.singleUseCard &&
						!availableActions.includes('PLAY_SINGLE_USE_CARD')
					) {
						availableActions.push('PLAY_SINGLE_USE_CARD')
					}

					if (!availableActions.includes('PLAY_EFFECT_CARD')) {
						availableActions.push('PLAY_EFFECT_CARD')
					}
				}

				return availableActions
			}
		)

		// at the end of the turn, delete custom gem data
		game.hooks.turnEnd.tap(this.id, (derivedState) => {
			const {currentPlayer} = derivedState
			delete currentPlayer.custom[this.id]
		})
	}

	// disables gems ability if its available
	tryDisableAbility(derivedState) {
		const {currentPlayer} = derivedState
		const abilityActive = currentPlayer.custom[this.id] === 1
		if (abilityActive) {
			// disable ability
			currentPlayer.custom[this.id] = 2
		}
	}
}

export default GeminiTayRareHermitCard
