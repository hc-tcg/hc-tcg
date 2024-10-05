import {expect, test} from '@playwright/experimental-ct-react'
import {ChatContent, ChatMessageDisplay} from 'client/app/game/chat/chat'
import {LineNode, formatText} from 'common/utils/formatting'

test.use({viewport: {width: 800, height: 500}})

test('Players and spectators view messages correctly.', async ({mount}) => {
	let messages = [
		{
			message: LineNode(),
			isBattleLogMessage: false,
			sender: 'playerOne',
			createdAt: 0,
		},
		{
			message: LineNode(),
			isBattleLogMessage: false,
			sender: 'playerTwo',
			createdAt: 0,
		},
		{
			message: formatText('$sSpectator$ Hello, I am a spectator.'),
			isBattleLogMessage: false,
			sender: 'spectator',
			createdAt: 0,
		},
		{
			message: formatText('$pPlayer One$ Hello, I am a player.'),
			isBattleLogMessage: false,
			sender: 'playerOne',
			createdAt: 0,
		},
		{
			message: formatText('$pPlayer Two$ Hello, I am a player.'),
			isBattleLogMessage: false,
			sender: 'playerTwo',
			createdAt: 0,
		},
	].reverse() as Array<ChatMessageDisplay>

	const component = await mount(
		<ChatContent
			chatMessages={messages}
			showLog={true}
			isSpectating={false}
			profanityFilterEnabled={false}
			playerNames={['Player One', 'Player Two']}
		/>,
	)
	await expect(component).toHaveScreenshot()
	await component.unmount()

	const component2 = await mount(
		<ChatContent
			chatMessages={messages}
			showLog={true}
			isSpectating={true}
			profanityFilterEnabled={false}
			playerNames={['Player One', 'Player Two']}
		/>,
	)
	await expect(component2).toHaveScreenshot()
	await component2.unmount()
})

test('Batlte log messages are hidden properly.', async ({mount}) => {
	let messages = [
		{
			message: formatText(
				'This is a battle log message. If this shows up in the snapshot, the test has failed',
			),
			isBattleLogMessage: true,
			sender: 'playerOne',
			createdAt: 0,
		},
		{
			message: formatText(
				'This is not a battle log message so it should show.',
			),
			isBattleLogMessage: false,
			sender: 'playerOne',
			createdAt: 0,
		},
	].reverse() as Array<ChatMessageDisplay>

	const component = await mount(
		<ChatContent
			chatMessages={messages}
			showLog={false}
			isSpectating={false}
			profanityFilterEnabled={false}
			playerNames={['Player One', 'Player Two']}
		/>,
	)
	await expect(component).toHaveScreenshot()
})

test('Messages do not have colors for formatting.', async ({
	mount,
}) => {
	let messages: Array<ChatMessageDisplay> = [
		{
			message: formatText('*Some formatted text*'),
			isBattleLogMessage: false,
			sender: 'playerOne',
			createdAt: 0,
		},
	]

	const component = await mount(
		<ChatContent
			chatMessages={messages}
			showLog={true}
			isSpectating={false}
			profanityFilterEnabled={false}
			playerNames={['Player One', 'Player Two']}
		/>,
	)
	await expect(component).toHaveScreenshot()
	await component.unmount()
	const component2 = await mount(
		<ChatContent
			chatMessages={messages}
			showLog={true}
			isSpectating={true}
			profanityFilterEnabled={false}
			playerNames={['Player One', 'Player Two']}
		/>,
	)
	await expect(component2).toHaveScreenshot()
})
