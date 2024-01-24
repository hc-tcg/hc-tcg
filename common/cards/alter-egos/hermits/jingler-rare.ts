import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import {discardFromHand} from '../../../utils/movement'
import HermitCard from '../../base/hermit-card'

class JinglerRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'jingler_rare',
			numericId: 133,
			name: 'Jingler',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 280,
			primary: {
				name: 'Jingled',
				cost: ['speedrunner'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Deception',
				cost: ['speedrunner', 'speedrunner', 'any'],
				damage: 80,
				power: 'Flip a coin. If heads, opponent must discard a card from their hand.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const followUpKey = this.getInstanceKey(instance)

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			if (attack.type !== 'secondary' || !attack.target) return
			const coinFlip = flipCoin(player, this.id)
			if (coinFlip[0] === 'tails') return

			// Add a new pick request for the opponent player
			game.addPickRequest({
				playerId: opponentPlayer.id,
				id: this.id,
				message: 'Pick 1 card from your hand to discard',
				onResult(pickResult) {
					// Validation
					if (pickResult.playerId !== opponentPlayer.id) return 'FAILURE_WRONG_PLAYER'
					if (pickResult.slot.type !== 'hand') return 'FAILURE_INVALID_SLOT'

					discardFromHand(opponentPlayer, pickResult.card)

					return 'SUCCESS'
				},
				onTimeout() {
					// Discard the first card in the opponent's hand
					discardFromHand(opponentPlayer, opponentPlayer.hand[0])
				},
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.afterAttack.remove(instance)
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

export default JinglerRareHermitCard
