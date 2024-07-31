import {PlayerDeckT} from '../types/deck'
import {LocalCardInstance, WithoutFunctions} from '../types/server-requests'
import {validateDeck} from '../utils/validation'
import {censorString} from '../utils/formatting'
import {encode, decode} from 'js-base64'
import {CARDS} from '../cards'
import {PlayerId} from './player-model'
import {CardEntity, newEntity} from '../entities'

export class VirtualPlayerModel {
	private internalId: PlayerId
	private internalSecret: string
	private internalDeck: PlayerDeckT
	public name: string
	public minecraftName: string
	public censoredName: string
	public socket: null
	public ai: string

	constructor(playerName: string, minecraftName: string, ai: string) {
		this.internalId = Math.random().toString() as PlayerId
		this.internalSecret = Math.random().toString()

		// always generate a starter deck as the default
		this.internalDeck = {
			name: 'virtual',
			icon: 'any',
			cards: this.getHashFromDeck(
				this.possibleDecks[Math.floor(Math.random() * this.possibleDecks.length)]
			),
		}

		this.name = playerName
		this.minecraftName = minecraftName
		this.censoredName = censorString(playerName)

		this.socket = null
		this.ai = ai
	}

	private possibleDecks = ['woHCgcKBUVFRwojCiMKVwpUODg4YGDw8PDs7Ozs7Ozs7Ozs7Ozs7wogjI8KWGTsaGgca']

	private getHashFromDeck(hash: string): Array<LocalCardInstance> {
		try {
			var b64 = decode(hash)
				.split('')
				.map((char) => char.charCodeAt(0))
		} catch (err) {
			return []
		}
		const deck = []
		for (let i = 0; i < b64.length; i++) {
			const card = Object.values(CARDS).find((value) => value.props.numericId === b64[i])
			if (!card) continue
			deck.push({
				props: WithoutFunctions(card.props),
				entity: newEntity('card-entity') as CardEntity,
				slot: null,
				turnedOver: false,
				attackHint: null,
			})
		}
		return deck
	}

	public get id() {
		return this.internalId
	}
	public get secret() {
		return this.internalSecret
	}
	public get deck() {
		return this.internalDeck
	}

	getPlayerInfo() {
		return {
			playerId: this.id,
			playerSecret: this.secret,
			playerDeck: this.deck,
			playerName: this.name,
			minecraftName: this.minecraftName,
			censoredPlayerName: this.censoredName,
		}
	}

	setPlayerDeck(newDeck: PlayerDeckT) {
		if (!newDeck || !newDeck.cards) return
		const validationMessage = validateDeck(newDeck.cards)
		if (validationMessage) return
		this.internalDeck = {
			name: newDeck.name,
			icon: newDeck.icon,
			cards: newDeck.cards,
		}
	}

	setMinecraftName(name: string) {
		this.minecraftName = name
	}
}
