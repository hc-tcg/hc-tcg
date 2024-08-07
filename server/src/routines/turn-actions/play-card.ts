import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {GameModel} from 'common/models/game-model'
import {PlayCardActionData} from 'common/types/turn-action-data'
import {ActionResult} from 'common/types/game-state'

function* playCardSaga(
	game: GameModel,
	turnAction: PlayCardActionData,
): Generator<any, ActionResult> {
	// Make sure data sent from client is correct
	const slotEntity = turnAction?.slot
	const localCard = turnAction?.card
	if (!slotEntity || !localCard) {
		return 'FAILURE_INVALID_DATA'
	}

	const card = game.components.find(
		CardComponent,
		query.card.entity(localCard.entity),
	)
	if (!card) return 'FAILURE_INVALID_DATA'

	const {currentPlayer} = game

	const pickedSlot = game.components.get(slotEntity)
	if (!pickedSlot || !pickedSlot.onBoard()) {
		throw new Error(
			'A slot that is not on the board can not be picked: ' + pickedSlot,
		)
	}

	// You are not supposed to be able to select a slot with a card in it, but network issues can allow
	// this to happen.
	if (pickedSlot.getCard()) {
		return 'FAILURE_INVALID_DATA'
	}

	const row = pickedSlot.row
	const rowIndex = pickedSlot.index
	const player = pickedSlot.player

	// Do we meet requirements to place the card
	const canAttach = card?.card.props.attachCondition(game, pickedSlot) || false

	// It's the wrong kind of slot or does not satisfy the condition
	if (!canAttach) return 'FAILURE_INVALID_SLOT'

	// Finally, execute depending on where we tried to place
	// And set the action result to be sent to the client

	// Single use slot
	if (pickedSlot.type === 'single_use') {
		card.attach(pickedSlot)
	} else {
		// All other positions requires us to have selected a valid row
		if (!row || rowIndex === null) return 'FAILURE_CANNOT_COMPLETE'

		switch (pickedSlot.type) {
			case 'hermit': {
				currentPlayer.hasPlacedHermit = true
				if (!card.isHealth())
					throw Error(
						'Attempted to add card that does not implement health to hermit slot: ' +
							card.props.numericId,
					)

				card.attach(pickedSlot)
				pickedSlot.row.health = card.props.health

				if (player?.activeRowEntity === null) {
					currentPlayer.changeActiveRow(pickedSlot.row)
				}

				break
			}
			case 'item': {
				if (card.props.category === 'item')
					game.addCompletedActions('PLAY_ITEM_CARD')
				card.attach(pickedSlot)
				break
			}
			case 'attach': {
				if (!card.card.isAttach())
					throw Error(
						'Attempted to add card that implement attach to an attach slot: ' +
							card.props.numericId,
					)
				card.attach(pickedSlot)
				break
			}
			default:
				throw new Error(
					'Unknown slot type when trying to play a card: ' + pickedSlot.type,
				)
		}
	}

	// Add entry to battle log, unless it is played in a single use slot
	if (pickedSlot.type !== 'single_use') {
		game.battleLog.addPlayCardEntry(card, currentPlayer.coinFlips, pickedSlot)
	}

	// Call onAttach hook
	currentPlayer.hooks.onAttach.call(card)

	return 'SUCCESS'
}

export default playCardSaga
