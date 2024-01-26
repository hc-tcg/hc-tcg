import {MessageTextT} from './game-state'

export type MessageInfoT = {
	createdAt: number
	message: Array<MessageTextT>
	censoredMessage: Array<MessageTextT>
	playerId: string
	systemMessage: boolean
}
