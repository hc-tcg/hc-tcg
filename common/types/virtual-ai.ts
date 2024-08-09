import {AIComponent} from '../components/ai-component'
import {PlayerEntity} from '../entities'
import {GameModel} from '../models/game-model'
import {TurnAction} from './game-state'

export type VirtualAIReturn = {
	type: TurnAction
	payload?: any
	playerEntity: PlayerEntity
}

export interface VirtualAI {
	get id(): string

	getTurnAction(
		game: GameModel,
		component: AIComponent,
	): Generator<any, VirtualAIReturn>
}

export type AIClass = new () => VirtualAI
