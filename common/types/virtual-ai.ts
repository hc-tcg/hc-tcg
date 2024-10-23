import {AIComponent} from '../components/ai-component'
import {GameModel} from '../models/game-model'
import {AnyTurnActionData} from './turn-action-data'

export type VirtualAI = {
	readonly id: string

	setup(game: GameModel, component: AIComponent): void
	getTurnActions(
		game: GameModel,
		component: AIComponent,
	): Generator<AnyTurnActionData>
}
