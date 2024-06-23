import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {slot} from '../../../slot'
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
				power:
					'Flip a coin.\nIf heads, your opponent must choose a card to discard from their hand.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(instance, (attack) => {
			if (attack.id !== this.getInstanceKey(instance)) return
			const attacker = attack.getAttacker()
			if (attack.type !== 'secondary' || !attack.getTarget() || !attacker) return
			const coinFlip = flipCoin(player, attacker.row.hermitCard)
			if (coinFlip[0] === 'tails') return

			game.addPickRequest({
				playerId: opponentPlayer.id,
				id: this.id,
				message: 'Pick 1 card from your hand to discard',
				canPick: slot.hand,
				onResult(pickedSlot) {
					discardFromHand(opponentPlayer, pickedSlot.card)
				},
				onTimeout() {
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
