import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import {CardComponent, ObserverComponent} from '../../../components'
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

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return
			if (!game.components.exists(CardComponent, card.slot(slot.hand), card.opponentPlayer)) return // Do not roll if player has no more cards in hand
			const coinFlip = flipCoin(player, component)
			if (coinFlip[0] === 'tails') return

			game.addPickRequest({
				playerId: opponentPlayer.id,
				id: component.entity,
				message: 'Pick 1 card from your hand to discard',
				canPick: query.slot.hand,
				onResult(pickedSlot) {
					pickedSlot.getCard()?.discard()
				},
				onTimeout() {
					game.components
						.find(CardComponent, query.card.slot(query.slot.hand), query.card.opponentPlayer)
						?.discard()
				},
			})
		})
	}
}

export default JinglerRare
