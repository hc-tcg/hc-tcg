import {
	clientMessages,
	RecievedClientMessage,
} from 'common/socket-messages/client-messages'
import {getGame} from '../selectors'
import {select} from 'typed-redux-saga'
import {assert} from 'common/utils/assert'
import {CardComponent} from 'common/components'
import query from 'common/components/query'
import {broadcast} from 'utils/comm'
import {serverMessages} from 'common/socket-messages/server-messages'
import {getLocalCard} from 'common/game/make-local-state'
import root from 'serverRoot'
import {LocalCardInstance} from 'common/types/server-requests'

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
				return
			}
			// We do not want to show the other player's cards if a player cheats
			if (cardData.player.entity !== playerEntity) {
				return
			}
			cards.push(getLocalCard(game.game, cardData))
		}
	}

	broadcast([root.players[message.playerId]], {
		type: serverMessages.HIDDEN_CARD_REVEAL,
		cards: cards,
	})
}
