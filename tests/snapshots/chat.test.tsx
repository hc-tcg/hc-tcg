import {describe, expect, test} from '@jest/globals'
import * as ReactTestRenderer from 'react-test-renderer'
import {ChatContent, ChatMessageDisplay} from 'client/app/game/chat/chat'
import {formatText, LineNode} from 'common/utils/formatting'

describe('Test chat messages', () => {
	test('Basic Test', () => {
		let chatMessages: Array<ChatMessageDisplay> = [
			{
				message: LineNode(),
				isBattleLogMessage: true,
				sender: 'playerOne',
				createdAt: 0,
			},
			{
				message: formatText('Hello Everyone, I am Player One.'),
				isBattleLogMessage: false,
				sender: 'playerOne',
				createdAt: 0,
			},
			{
				message: formatText('Hello Everyone, I am Player Two.'),
				isBattleLogMessage: false,
				sender: 'playerTwo',
				createdAt: 0,
			},
			{
				message: LineNode(),
				isBattleLogMessage: true,
				sender: 'playerTwo',
				createdAt: 0,
			},
		]

		expect(
			ReactTestRenderer.create(
				<ChatContent
					chatMessages={chatMessages}
					showLog={true}
					profanityFilterEnabled={true}
					isSpectating={false}
					playerNames={['Player One', 'Player Two']}
				/>,
			).toJSON(),
		).toMatchSnapshot()
	})
})
