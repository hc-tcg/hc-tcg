import {getStarterPack} from '../utils/state-gen'
import profanityFilter from '../utils/profanity'
import {validateDeck} from '../utils/validation'

/**
 * @typedef {import('socket.io').Socket} Socket
 * @typedef {import('common/types/deck').PlayerDeckT} PlayerDeckT
 */

// @TODO store playerState on player.state, instead of game.state.players, to avoid confusion?

export class PlayerModel {
	/**
	 * @param {string} playerName
	 * @param {Socket} socket
	 */
	constructor(playerName, socket) {
		// create a new player

		// @TODO remove "player" in values everywhere, e.g. player.id and player.secret, rather than player.playerId and player.playerSecret
		// need to make sure it's done everywhere tho
		/** @type {string} */
		this.id = Math.random().toString()

		/** @type {string} */
		this.secret = Math.random().toString()

		// always generate a starter deck as the default
		/**@type {PlayerDeckT}*/
		this.deck = {
			name: 'Starter Deck',
			icon: 'any',
			cards: getStarterPack().map((id) => {
				return {cardId: id, cardInstance: Math.random().toString()}
			}),
		}

		/** @type {string} */
		this.name = playerName

		/** @type {string} */
		this.censoredName = profanityFilter(playerName)

		/** @type {Socket} */
		this.socket = socket
	}

	getPlayerInfo() {
		return {
			playerId: this.id,
			playerSecret: this.secret,
			playerDeck: this.deck,
			playerName: this.name,
			censoredPlayerName: this.censoredName,
		}
	}

	/** @param {PlayerDeckT} newDeck */
	setPlayerDeck(newDeck) {
		if (!newDeck) return
		const validationMessage = validateDeck(
			newDeck.cards.map((card) => card.cardId)
		)
		if (validationMessage) return
		this.deck = newDeck
	}
}
