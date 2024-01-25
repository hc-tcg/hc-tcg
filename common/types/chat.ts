import {BattleLogDescriptionT} from './game-state'

export type MessageInfoT = {
	createdAt: number
	message: string | Array<BattleLogDescriptionT>
	censoredMessage: string | Array<BattleLogDescriptionT>
	playerId: string
	systemMessage: boolean
}
