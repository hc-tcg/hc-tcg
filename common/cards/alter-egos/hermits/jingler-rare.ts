import {GameModel} from '../../../models/game-model'
import {card, slot} from '../../../components/query'
import {CardComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

class JinglerRare extends Card {
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
		const {player, opponentPlayer} = component

		player.hooks.afterAttack.add(component, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			const coinFlip = flipCoin(player, component)
			if (coinFlip[0] === 'tails') return

			game.addPickRequest({
				playerId: opponentPlayer.id,
				id: component.entity,
				message: 'Pick 1 card from your hand to discard',
				canPick: slot.hand,
				onResult(pickedSlot) {
					pickedSlot.getCard()?.discard()
				},
				onTimeout() {
					game.components.find(CardComponent, card.slot(slot.hand), card.opponentPlayer)?.discard()
				},
			})
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.afterAttack.remove(component)
	}
}

export default JinglerRare
