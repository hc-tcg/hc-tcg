import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
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

const GrianRare: Hermit = {
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
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'primary')
				return

			const opponentAttachCard = game.components.find(
				CardComponent,
				query.card.opponentPlayer,
				query.card.active,
				query.card.slot(query.slot.attach, query.not(query.slot.frozen)),
			)
			if (!opponentAttachCard) return

			const coinFlip = flipCoin(player, component)

			if (coinFlip[0] === 'tails') return

			const attachSlot = game.components.find(
				SlotComponent,
				query.slot.currentPlayer,
				query.slot.active,
				query.slot.attach,
			)
			const canAttach = game.components.find(
				SlotComponent,
				query.slot.currentPlayer,
				query.not(query.slot.frozen),
				query.slot.attach,
				query.slot.active,
				query.slot.empty,
			)

			game.addModalRequest({
				player: player.entity,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'Grian - Borrow',
						modalDescription: `Would you like to attach or discard your opponent's ${opponentAttachCard.props.name} card?`,
						cards: [opponentAttachCard.entity],
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
					if (!modalResult || modalResult.result === undefined)
						return 'FAILURE_INVALID_DATA'

					if (modalResult.result) {
						if (attachSlot) opponentAttachCard.attach(attachSlot)
					} else {
						opponentAttachCard.discard(component.player.entity)
					}

					return 'SUCCESS'
				},
				onTimeout() {
					opponentAttachCard.discard(component.player.entity)
				},
			})
		})
	},
}

export default GrianRare
