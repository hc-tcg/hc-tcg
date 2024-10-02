import {expect, test} from '@playwright/test'
import {
	ChatContent,
	ChatMessageDisplay,
} from 'client/src/app/game/chat/chat.tsx'

test('event should work', async ({mount}) => {
  let messages: Array<ChatMessageDisplay> = []
	const component = await mount(<ChatContent chatMessages={messages} />)
	component.screenshot()
})

