import {AIComponent} from '../components/ai-component'
import {GameModel} from '../models/game-model'
import {AnyTurnActionData} from './turn-action-data'

export type VirtualAI = {
	readonly id: string

	getTurnAction(
		game: GameModel,
		component: AIComponent,
	): Generator<any, AnyTurnActionData>
}
