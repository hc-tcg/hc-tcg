import {Socket} from 'socket.io'
import {PlayerDeck} from '../../common/types/deck'
import {PlayerInfo} from '../types/server-requests'
import {censorString} from '../utils/formatting'

export type PlayerId = string & {__player_id: never}

export class PlayerModel {
	private internalId: PlayerId
	private internalSecret: string
	private internalDeck: PlayerDeck
	public name: string
	public minecraftName: string
	public censoredName: string
	public socket: Socket
	public uuid: string | null
	public authenticated: boolean

	constructor(playerName: string, minecraftName: string, socket: Socket) {
		this.internalId = Math.random().toString() as PlayerId
		this.internalSecret = Math.random().toString()

		this.internalDeck = {
			name: 'Starter Deck',
			icon: 'any',
			code: '',
			cards: [],
			tags: [],
		}

		this.name = playerName
		this.minecraftName = minecraftName
		this.censoredName = censorString(playerName)
		this.socket = socket
		this.uuid = null
		this.authenticated = false
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

	getPlayerInfo(): PlayerInfo {
		return {
			playerId: this.id,
			playerSecret: this.secret,
			playerDeck: this.deck,
			playerName: this.name,
			minecraftName: this.minecraftName,
			censoredPlayerName: this.censoredName,
		}
	}

	setPlayerDeck(newDeck: PlayerDeck) {
		this.internalDeck = {
			name: newDeck.name,
			icon: newDeck.icon,
			cards: newDeck.cards,
			code: newDeck.code,
			tags: newDeck.tags,
		}
	}

	setMinecraftName(name: string) {
		this.minecraftName = name
	}
}
