import {CardComponent, ObserverComponent, SlotComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {afterAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const GrianRare: Hermit = {
	...hermit,
	id: 'grian_rare',
	numericId: 20,
	name: 'Grian',
	expansion: 'default',
	rarity: 'rare',
	tokens: 2,
	type: ['prankster'],
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

		observer.subscribeWithPriority(
			game.hooks.afterAttack,
			afterAttack.HERMIT_ATTACK_REQUESTS,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'primary')
					return

				const opponentAttachCard = game.components.find(
					CardComponent,
					query.card.opponentPlayer,
					query.card.active,
					query.card.slot(query.slot.attach, query.not(query.slot.frozen)),
				)
				if (!opponentAttachCard) return

				const coinFlip = flipCoin(game, player, component)

				if (coinFlip[0] === 'tails') return

				const attachSlot = game.components.find(
					SlotComponent,
					query.slot.currentPlayer,
					query.slot.active,
					query.slot.attach,
				)
				const canAttach =
					component.isAlive() &&
					game.components.exists(
						SlotComponent,
						query.slot.currentPlayer,
						query.not(query.slot.frozen),
						query.slot.attach,
						query.slot.active,
						query.slot.empty,
					)

				game.addModalRequest({
					player: player.entity,
					modal: {
						type: 'selectCards',
						name: 'Grian - Borrow',
						description: `Would you like to attach or discard your opponent's ${opponentAttachCard.props.name} card?`,
						cards: [opponentAttachCard.entity],
						selectionSize: 0,
						cancelable: false,
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
					onResult(modalResult) {
						if (modalResult.result && canAttach && attachSlot) {
							opponentAttachCard.attach(attachSlot)
						} else {
							opponentAttachCard.discard(component.player.entity)
						}

						return
					},
					onTimeout() {
						opponentAttachCard.discard(component.player.entity)
					},
				})
			},
		)
	},
}

export default GrianRare
