import {Card} from '../cards/types'
import {AIComponent} from '../components/ai-component'
import {GameModel} from '../models/game-model'
import {AnyTurnActionData} from './turn-action-data'

export type VirtualAI = {
	readonly id: string

	getDeck(): Array<Card>
	setup(game: GameModel): void
	getTurnActions(
		game: GameModel,
		component: AIComponent,
	): Generator<AnyTurnActionData>
}
