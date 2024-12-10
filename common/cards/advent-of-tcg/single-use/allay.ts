import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
} from '../../../components'
import query from '../../../components/query'
import {GameModel} from '../../../models/game-model'
import {applySingleUse} from '../../../utils/board'
import {singleUse} from '../../defaults'
import Clock from '../../single-use/clock'
import {SingleUse} from '../../types'

const pickCondition = query.every(
	query.slot.currentPlayer,
	query.slot.hand,
	query.not(query.slot.has(Clock)),
	(game, slot) => {
		const card = slot.getCard()
		if (!card?.isSingleUse() && !card?.isAttach()) return false
		// Prevent infinite loop
		if (query.card.is(Allay)(game, card)) return false

		return game.components.exists(
			SlotComponent,
			query.slot.currentPlayer,
			query.slot.discardPile,
			query.slot.has(card.props),
		)
	},
)

const Allay: SingleUse = {
	...singleUse,
	id: 'allay',
	name: 'Allay',
	expansion: 'advent_of_tcg_ii',
	numericId: 242,
	rarity: 'rare',
	tokens: 1,
	description:
		'Show an effect card in your hand to the opponent, that is not another Allay card. Retrieve a copy of the card you showed from your discard pile.\nYou can use another single use effect card this turn.',
	attachCondition: query.every(
		singleUse.attachCondition,
		query.exists(SlotComponent, pickCondition),
	),
	log: (values) =>
		`${values.defaultLog} to retrieve a copy of $e${values.pick.name}$`,
	onAttach(
		game: GameModel,
		component: CardComponent,
		_observer: ObserverComponent,
	) {
		const {player, opponentPlayer} = component

		game.addPickRequest({
			player: player.entity,
			id: component.entity,
			message: 'Pick an effect card in your hand to show your opponent.',
			canPick: pickCondition,
			onResult(pickedSlot) {
				const pickedCard = pickedSlot.getCard()

				if (!pickedCard) return

				game.components
					.find(
						CardComponent,
						query.card.currentPlayer,
						query.card.slot(query.slot.discardPile),
						query.card.is(pickedCard.props),
					)
					?.draw()

				game.addModalRequest({
					player: opponentPlayer.entity,
					modal: {
						type: 'selectCards',
						name: 'Allay',
						description: 'Card your opponent retrieved a copy of.',
						cards: [pickedCard.entity],
						selectionSize: 0,
						primaryButton: {
							text: 'Close',
							variant: 'default',
						},
						cancelable: true,
					},
					onResult() {},
					onTimeout() {
						// Do nothing
					},
				})

				applySingleUse(game, pickedSlot)

				if (component.slot.onBoard()) component.discard()
				// Remove playing a single use from completed actions so it can be done again
				game.removeCompletedActions('PLAY_SINGLE_USE_CARD')
				player.singleUseCardUsed = false
			},
		})
	},
}

export default Allay
