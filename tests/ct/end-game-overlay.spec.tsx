import {expect, test} from '@playwright/experimental-ct-react'
import EndGameOverlay from 'client/app/game/end-game-overlay'
import {PlayerEntity} from 'common/entities'

test('You won by killing all hermits!', async ({mount}) => {
	let entity = 'playerOne' as PlayerEntity

	const component = await mount(
		<EndGameOverlay
			nameOfWinner={'Winner Name'}
			nameOfLoser={'Loser Name'}
			outcome={{
				type: 'player-won',
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

test('You lost because your hermits were killed.', async ({mount}) => {
	let playerOneEntity = 'playerOne' as PlayerEntity
	let playerTwoEntity = 'playerTwo' as PlayerEntity

	const component = await mount(
		<EndGameOverlay
			nameOfWinner={'Winner Name'}
			nameOfLoser={'Loser Name'}
			outcome={{
				type: 'player-won',
				winner: playerOneEntity,
				victoryReason: 'no-hermits-on-board',
			}}
			viewer={{
				type: 'player',
				entity: playerTwoEntity,
			}}
		/>,
	)

	await expect(component).toHaveScreenshot()
})

test('Viewing as spectator shows victory.', async ({mount}) => {
	let playerOneEntity = 'playerOne' as PlayerEntity

	const component = await mount(
		<EndGameOverlay
			nameOfWinner={'Winner Name'}
			nameOfLoser={'Loser Name'}
			outcome={{
				type: 'player-won',
				winner: playerOneEntity,
				victoryReason: 'no-hermits-on-board',
			}}
			viewer={{
				type: 'spectator',
			}}
		/>,
	)

	await expect(component).toHaveScreenshot()
})

test('Game crash displays correctly.', async ({mount}) => {
	const component = await mount(
		<EndGameOverlay
			nameOfWinner={'Winner Name'}
			nameOfLoser={'Loser Name'}
			outcome={{type: 'game-crash', error: 'The reason the game crashed'}}
			viewer={{
				type: 'spectator',
			}}
		/>,
	)

	await expect(component).toHaveScreenshot()
})

test('Game timeout displays correctly.', async ({mount}) => {
	const component = await mount(
		<EndGameOverlay
			nameOfWinner={'Winner Name'}
			nameOfLoser={'Loser Name'}
			outcome={{type: 'timeout'}}
			viewer={{
				type: 'spectator',
			}}
		/>,
	)

	await expect(component).toHaveScreenshot()
})
