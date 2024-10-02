import {expect, test} from '@playwright/experimental-ct-react'
import {ChatContent, ChatMessageDisplay} from 'client/app/game/chat/chat'
import {formatText} from 'common/utils/formatting'

test('Empty Chat Messages Display Properly', async ({mount}) => {
	let messages: Array<ChatMessageDisplay> = []
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
})

test('A message', async ({mount}) => {
	let messages = [
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
			isSpectating={true}
			profanityFilterEnabled={false}
			playerNames={['Player One', 'Player Two']}
		/>,
	)
	await expect(component).toHaveScreenshot()
})
