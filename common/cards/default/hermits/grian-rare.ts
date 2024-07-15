import {GameModel} from '../../../models/game-model'
import {card, query, slot} from '../../../components/query'
import {CardComponent, SlotComponent} from '../../../components'
import {flipCoin} from '../../../utils/coinFlips'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'

// The tricky part about this one are destroyable items (shield, totem, loyalty) since they are available at the moment of attack, but not after

/*
Some assumptions that make sense to me:
- Shield can't be stolen as they get used up during the attack
- If hermitMultiplier is 0 (e.g. invis potion), then shield don't get used and so you can steal it
- Totem/Loyalty can be stolen unless it was used
- If you choose to discard the card it gets discarded to your discard pile
*/

class GrianRareHermitCard extends Card {
	props: Hermit = {
		...hermit,
		id: 'grian_rare',
		numericId: 35,
		name: 'Grian',
		expansion: 'default',
		rarity: 'rare',
		tokens: 2,
		type: 'prankster',
		health: 300,
		primary: {
			name: 'Borrow',
			cost: ['prankster', 'prankster'],
			damage: 50,
			power:
				"After your attack, flip a coin.\nIf heads, steal the attached effect card of your opponent's active Hermit, and then choose to attach or discard it.",
		},
		secondary: {
			name: 'Start a War',
			cost: ['prankster', 'prankster', 'prankster'],
			damage: 100,
			power: null,
		},
	}

	override onAttach(game: GameModel, component: CardComponent) {
		const {player} = component

		player.hooks.afterAttack.add(component, (attack) => {
			if (!component.slot.inRow()) return
			if (attack.attacker?.entity !== component.entity) return
			if (attack.type !== 'primary') return

			const coinFlip = flipCoin(player, component)

			if (coinFlip[0] === 'tails') return

			const opponentAttachCard = game.components.find(
				CardComponent,
				card.opponentPlayer,
				card.active,
				card.attached
			)
			if (!opponentAttachCard) return

			const attachSlot = game.components.find(
				SlotComponent,
				slot.currentPlayer,
				slot.activeRow,
				slot.attachSlot
			)
			const canAttach = game.components.find(
				SlotComponent,
				slot.currentPlayer,
				query.not(slot.frozen),
				slot.attachSlot,
				slot.activeRow,
				slot.empty
			)

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'Grian - Borrow',
						modalDescription: `Would you like to attach or discard your opponent's ${opponentAttachCard.props.name} card?`,
						cards: [opponentAttachCard.toLocalCardInstance()],
						selectionSize: 0,
						primaryButton: canAttach
							? {
									text: 'Attach',
									variant: 'default',
								}
							: null,
						secondaryButton: {
							text: 'Discard',
							variant: 'default',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult || modalResult.result === undefined) return 'FAILURE_INVALID_DATA'

					if (modalResult.result) {
						if (attachSlot) opponentAttachCard.attach(attachSlot)
					} else {
						opponentAttachCard.discard()
					}

					return 'SUCCESS'
				},
				onTimeout() {
					opponentAttachCard.discard()
				},
			})
		})
	}

	override onDetach(_game: GameModel, component: CardComponent) {
		const {player} = component
		player.hooks.afterAttack.remove(component)
	}
}

export default GrianRareHermitCard
