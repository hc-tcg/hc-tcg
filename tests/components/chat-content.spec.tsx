import {test} from '@playwright/experimental-ct-react'
import {ChatContent} from 'client/app/game/chat/chat'

test('event should work', async ({mount}) => {
	let messages: Array<ChatMessageDisplay> = []
	const component = await mount(<ChatContent chatMessages={messages} />)
	component.toHaveScreenshot()
})
