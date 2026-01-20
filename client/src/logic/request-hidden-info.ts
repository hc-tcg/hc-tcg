import {unknownCard} from 'common/components/card-component'
import {clientMessages} from 'common/socket-messages/client-messages'
import {LocalGameState} from 'common/types/game-state'
import {sendMsg} from './socket/socket-saga'

export function* requestHiddenInfo(state: LocalGameState) {
	let hiddenCards = state.hand.filter(
		(card) => card.id === unknownCard.numericId,
	)

	let cardsThatNeedToBeFetched = hiddenCards.map((card) => card.entity)

	if (cardsThatNeedToBeFetched.length > 0) {
		yield* sendMsg({
			type: clientMessages.HIDDEN_CARD_REQUEST,
			cards: cardsThatNeedToBeFetched,
		})
	}
}
