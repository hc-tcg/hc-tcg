import {getStarterPack} from '../../server/src/utils/state-gen'
import {PlayerDeckT} from '../../common/types/deck'
import {Socket} from 'socket.io'
import {validateDeck} from '../utils/validation'
import {censorString} from '../utils/formatting'
import {LocalCardInstance} from '../types/server-requests'
import {PlayerId} from '../types/game-state'

export class PlayerModel {
	private internalId: PlayerId
	private internalSecret: string
	private internalDeck: {
		name: string
		icon: string
		cards: Array<string>
	}

	public name: string
	public minecraftName: string
	public censoredName: string
	public socket: Socket

	constructor(playerName: string, minecraftName: string, socket: Socket) {
		this.internalId = Math.random().toString() as PlayerId
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
		const validationMessage = validateDeck(newDeck.cards)
		if (validationMessage) return
		this.internalDeck = {
			name: newDeck.name,
			icon: newDeck.icon,
			cards: newDeck.cards.map((card) => card.instance),
		}
	}

	setMinecraftName(name: string) {
		this.minecraftName = name
	}
}
