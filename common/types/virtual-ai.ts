import {AIComponent} from '../components/ai-component'
import {GameModel} from '../models/game-model'
import {AnyTurnActionData} from './turn-action-data'

export type VirtualAI = {
	readonly id: string

	getTurnActions(
		game: GameModel,
		component: AIComponent,
	): Generator<AnyTurnActionData>
}
