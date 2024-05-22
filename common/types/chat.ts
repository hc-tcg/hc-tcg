import {FormattedSegment} from './game-state'

export type MessageInfoT = {
	createdAt: number
	message: Array<FormattedSegment>
	playerId: string
	systemMessage: boolean
}
