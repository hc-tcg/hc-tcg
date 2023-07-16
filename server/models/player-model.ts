import {getStarterPack} from '../utils/state-gen'
import profanityFilter from '../utils/profanity'
import {validateDeck} from '../utils/validation'
import {CardT} from '../../common/types/game-state'
import {PlayerDeckT} from '../../common/types/deck'
import {Socket} from 'socket.io'

export class PlayerModel {
	public playerId: string
	public playerSecret: string
	public playerDeck: {
		name: string
		icon: string
		cards: Array<CardT>
	}
	public playerName: string
	public censoredPlayerName: string
	public socket: Socket

	constructor(playerName: string, socket: Socket) {
		// @TODO remove "player" in values everywhere, e.g. player.id and player.secret, rather than player.playerId and player.playerSecret
		// need to make sure it's done everywhere tho
		this.playerId = Math.random().toString()
		this.playerSecret = Math.random().toString()

		// always generate a starter deck as the default
		this.playerDeck = {
			name: 'Starter Deck',
			icon: 'any',
			cards: getStarterPack().map((id) => {
				return {cardId: id, cardInstance: Math.random().toString()}
			}),
		}

		this.playerName = playerName
		this.censoredPlayerName = profanityFilter(playerName)
		this.socket = socket
	}

	getPlayerInfo() {
		return {
			playerId: this.playerId,
			playerSecret: this.playerSecret,
			playerDeck: this.playerDeck,
			playerName: this.playerName,
			censoredPlayerName: this.censoredPlayerName,
		}
	}

	setPlayerDeck(newDeck: PlayerDeckT) {
		if (!newDeck || !newDeck.cards) return
		const validationMessage = validateDeck(newDeck.cards.map((card) => card.cardId))
		if (validationMessage) return
		this.playerDeck = newDeck
	}
}
