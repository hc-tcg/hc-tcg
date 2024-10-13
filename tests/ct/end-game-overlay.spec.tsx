import {expect, test} from '@playwright/experimental-ct-react'
import EndGameOverlay from 'client/app/game/end-game-overlay'
import {PlayerEntity} from 'common/entities'

test('You won by killing all hermits!', async ({mount}) => {
	let entity = 'playerOne' as PlayerEntity

	const component = await mount(
		<EndGameOverlay
			nameOfWinner={null}
			outcome={{
				winner: entity,
				victoryReason: 'no-hermits-on-board',
			}}
			viewer={{
				type: 'player',
				entity: entity,
			}}
		/>,
	)
	await expect(component).toHaveScreenshot()
})
