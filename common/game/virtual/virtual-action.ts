import {AIComponent} from '../../components/ai-component'
import {GameController} from '../game-controller'
import {TurnActionAndPlayer} from '../run-game'

export default async function handleVirtualPlayerAction(
	con: GameController,
	component: AIComponent,
): Promise<TurnActionAndPlayer> {
	const coinFlips = con.game.currentPlayer.coinFlips
	await new Promise((resolve: any) =>
		setTimeout(resolve, con.getRandomDelayForAI(coinFlips)),
	)
	const action = component.getNextTurnAction()
	return {
		action: action,
		playerEntity: component.playerEntity,
	}
}
