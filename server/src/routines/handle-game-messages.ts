import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {getLocalCard} from 'common/game/make-local-state'
import {
	RecievedClientMessage,
	clientMessages,
} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalCardInstance} from 'common/types/server-requests'
import {assert} from 'common/utils/assert'
import root from 'serverRoot'
import {select} from 'typed-redux-saga'
import {broadcast} from 'utils/comm'
import {getGame} from '../selectors'

export function* spyglassRequestCards(
	message: RecievedClientMessage<typeof clientMessages.SPYGLASS_REQUEST_CARDS>,
) {
	let game = yield* select(getGame(message.playerId))
	assert(game, 'Player should be in game if sending a turn action message')
	let opponentHand = game.game.components.filter(
		CardComponent,
		query.card.opponentPlayer,
		query.card.slot(query.slot.hand),
	)
	broadcast([root.players[message.playerId]], {
		type: serverMessages.SPYGLASS_SEND_CARDS,
		cards: opponentHand.map((c) => getLocalCard(game.game, c)),
	})
}

export function* hiddenCardRequest(
	message: RecievedClientMessage<typeof clientMessages.HIDDEN_CARD_REQUEST>,
) {
	let game = yield* select(getGame(message.playerId))
	assert(game, 'Player should be in game if sending a turn action message')

	let playerEntity = game.getPlayerEntity(message.playerId)

	let cards: Array<LocalCardInstance> = []
	for (const card of message.payload.cards) {
		let cardData = game.game.components.get(card)
		if (cardData) {
			// Verify we only reveal cards in the player's hand
			if (cardData.slot.type !== 'hand') {
				//return
			}
			// We do not want to show the other player's cards if a player cheats
			if (cardData.player.entity !== playerEntity) {
				//ereturn
			}
			cards.push(getLocalCard(game.game, cardData))
		}
	}

	broadcast([root.players[message.playerId]], {
		type: serverMessages.HIDDEN_CARD_REVEAL,
		cards: cards,
	})
}
