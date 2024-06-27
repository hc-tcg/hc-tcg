import {getStarterPack} from '../../server/src/utils/state-gen'
import {CardInstance} from '../../common/types/game-state'
import {PlayerDeckT} from '../../common/types/deck'
import {Socket} from 'socket.io'
import {validateDeck} from '../utils/validation'
import {censorString} from '../utils/formatting'

export class PlayerModel {
	private internalId: string
	private internalSecret: string
	private internalDeck: {
		name: string
		icon: string
		cards: Array<CardInstance>
	}

	public name: string
	public minecraftName: string
	public censoredName: string
	public socket: Socket

	constructor(playerName: string, minecraftName: string, socket: Socket) {
		this.internalId = Math.random().toString()
		this.internalSecret = Math.random().toString()

		// Always generate a starter deck as the default
		this.internalDeck = {
			name: 'Starter Deck',
			icon: 'any',
			cards: getStarterPack(),
		}

		this.name = playerName
		this.minecraftName = minecraftName
		this.censoredName = censorString(playerName)
		this.socket = socket
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
		let deckCards = newDeck.cards.map((card) => CardInstance.fromLocalCardInstance(card))
		const validationMessage = validateDeck(deckCards)
		if (validationMessage) return
		this.internalDeck = {
			name: newDeck.name,
			icon: newDeck.icon,
			cards: deckCards,


			}
	}

	setMinecraftName(name: string) {
		this.minecraftName = name
	}
}
