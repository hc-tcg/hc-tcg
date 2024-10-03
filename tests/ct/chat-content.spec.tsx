import {expect, test} from '@playwright/experimental-ct-react'
import {ChatContent, ChatMessageDisplay} from 'client/app/game/chat/chat'
import {formatText, LineNode} from 'common/utils/formatting'

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
