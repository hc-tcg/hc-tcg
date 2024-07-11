import {GameModel} from '../../../models/game-model'
import {slot} from '../../../filters'
import {CardComponent} from '../../../types/game-state'
import {flipCoin} from '../../../utils/coinFlips'
import {discardFromHand} from '../../../utils/movement'
import Card, {Hermit, hermit} from '../../base/card'

class JinglerRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'jingler_rare',
		numericId: 133,
		name: 'Jingler',
		expansion: 'alter_egos',
		palette: 'alter_egos',
		background: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'speedrunner',
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
			power: 'Flip a coin.\nIf heads, your opponent must choose a card to discard from their hand.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player, opponentPlayer} = pos

		player.hooks.afterAttack.add(component, (attack) => {
			if (attack.id !== this.getInstanceKey(component)) return
			const attacker = attack.getAttacker()
			if (attack.type !== 'secondary' || !attack.getTarget() || !attacker) return
			const coinFlip = flipCoin(player, attacker.row.hermitCard)
			if (coinFlip[0] === 'tails') return

			game.addPickRequest({
				playerId: opponentPlayer.id,
				id: this.props.id,
				message: 'Pick 1 card from your hand to discard',
				canPick: slot.hand,
				onResult(pickedSlot) {
					discardFromHand(opponentPlayer, pickedSlot.cardId)
				},
				onTimeout() {
					discardFromHand(opponentPlayer, opponentPlayer.hand[0])
				},
			})
		})
	}

	override onDetach(game: GameModel, component: CardComponent) {
		const {player} = pos
		player.hooks.afterAttack.remove(component)
	}
}

export default JinglerRareHermitCard
