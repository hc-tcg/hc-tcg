import {unknownCard} from 'common/components/card-component'
import {LocalGameState} from 'common/types/game-state'
import {sendMsg} from './socket/socket-saga'
import {clientMessages} from 'common/socket-messages/client-messages'

export function* requestHiddenInfo(state: LocalGameState) {
	let hiddenCards = state.hand.filter(
		(card) => card.id === unknownCard.numericId,
	)

	let cardsThatNeedToBeFetched = hiddenCards.map((card) => card.entity)

	yield* sendMsg({
		type: clientMessages.HIDDEN_CARD_REQUEST,
		cards: cardsThatNeedToBeFetched,
	})
}
