import {AIComponent} from '../components/ai-component'
import {GameModel} from '../models/game-model'
import {AnyTurnActionData} from './turn-action-data'

export interface VirtualAI {
	get id(): string

	getTurnAction(
		game: GameModel,
		component: AIComponent,
	): Generator<any, AnyTurnActionData>
}

export type AIClass = new () => VirtualAI
