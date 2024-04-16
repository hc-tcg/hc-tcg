import profanityFilter from '../utils/profanity'
import {CardT} from '../types/game-state'
import {PlayerDeckT} from '../types/deck'
import {validateDeck} from '../utils/validation'
import {encode, decode} from 'js-base64'
import {CARDS} from '../cards'

export class VirtualPlayerModel {
	public playerId: string
	public playerSecret: string
	public playerDeck: {
		name: string
		icon: string
		cards: Array<CardT>
	}
	public playerName: string
	public minecraftName: string
	public censoredPlayerName: string
	public socket: null
	public ai: string

	constructor(playerName: string, minecraftName: string, ai: string) {
		// @TODO remove "player" in values everywhere, e.g. player.id and player.secret, rather than player.playerId and player.playerSecret
		// need to make sure it's done everywhere tho
		this.playerId = Math.random().toString()
		this.playerSecret = Math.random().toString()

		// always generate a starter deck as the default
		this.playerDeck = {
			name: 'virtual',
			icon: '',
			cards: this.getHashFromDeck(
				this.possibleDecks[Math.floor(Math.random() * this.possibleDecks.length)]
			),
		}

		this.playerName = playerName
		this.minecraftName = minecraftName
		this.censoredPlayerName = profanityFilter(playerName)

		this.socket = null
		this.ai = ai
	}

	private possibleDecks = ['woHCgcKBUVFRwojCiMKVwpUODg4YGDw8PDs7Ozs7Ozs7Ozs7Ozs7wogjI8KWGTsaGgca']

	private getHashFromDeck(hash: string): Array<CardT> {
		try {
			var b64 = decode(hash)
				.split('')
				.map((char) => char.charCodeAt(0))
		} catch (err) {
			return []
		}
		const deck = []
		for (let i = 0; i < b64.length; i++) {
			const cardId = Object.values(CARDS).find((value) => value.numericId === b64[i])?.id
			if (!cardId) continue
			deck.push({
				cardId: cardId,
				cardInstance: Math.random().toString(),
			})
		}
		const deckCards = deck.filter((card: CardT) => CARDS[card.cardId])
		return deckCards
	}

	getPlayerInfo() {
		return {
			playerId: this.playerId,
			playerSecret: this.playerSecret,
			playerDeck: this.playerDeck,
			playerName: this.playerName,
			minecraftName: this.minecraftName,
			censoredPlayerName: this.censoredPlayerName,
		}
	}

	setPlayerDeck(newDeck: PlayerDeckT) {
		if (!newDeck || !newDeck.cards) return
		const validationMessage = validateDeck(newDeck.cards.map((card) => card.cardId))
		if (validationMessage) return
		this.playerDeck = newDeck
	}

	setMinecraftName(name: string) {
		this.minecraftName = name
	}
}
