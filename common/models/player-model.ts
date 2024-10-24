import {Socket} from 'socket.io'
import {UnsavedDeck} from '../../common/types/deck'
import {getStarterPack} from '../../server/src/utils/state-gen'
import {PlayerInfo} from '../types/server-requests'
import {censorString} from '../utils/formatting'
import {validateDeck} from '../utils/validation'

export type PlayerId = string & {__player_id: never}

export class PlayerModel {
	private internalId: PlayerId
	private internalSecret: string
	private internalDeck: UnsavedDeck
	public name: string
	public minecraftName: string
	public censoredName: string
	public socket: Socket
	public uuid: string | null
	public authenticated: boolean

	constructor(playerName: string, minecraftName: string, socket: Socket) {
		this.internalId = Math.random().toString() as PlayerId
		this.internalSecret = Math.random().toString()

		// Always generate a starter deck as the default
		this.internalDeck = {
			name: 'Starter Deck',
			icon: 'any',
			cards: getStarterPack(),
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

	setPlayerDeck(newDeck: UnsavedDeck) {
		if (!newDeck || !newDeck.cards) return
		const validationResult = validateDeck(newDeck.cards)
		if (!validationResult.valid) return
		this.internalDeck = {
			name: newDeck.name,
			icon: newDeck.icon,
			cards: newDeck.cards,
			tags: newDeck.tags,
		}
	}

	setMinecraftName(name: string) {
		this.minecraftName = name
	}
}
