import classnames from 'classnames'
import ChatIcon from 'components/svgs/ChatIcon'
import ChatIconNotify from 'components/svgs/ChatIconNotify'
import {getChatMessages, getPlayerEntity} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {useState} from 'react'
import {useSelector} from 'react-redux'
import css from './toolbar.module.scss'

function ChatItem() {
	const chatMessages = useSelector(getChatMessages)
	const settings = useSelector(getSettings)
	const playerEntity = useSelector(getPlayerEntity)

	const latestOpponentMessageTime =
		chatMessages.filter((msg) => {
			return (
				['player', 'spectator'].includes(msg.sender.type) &&
				msg.sender.entityOrId !== playerEntity
			)
		})[0]?.createdAt || 0
	const [lastSeen, setLastSeen] = useState<number>(latestOpponentMessageTime)
	const dispatch = useMessageDispatch()

	if (settings.showChatWindow && lastSeen !== latestOpponentMessageTime) {
		setLastSeen(latestOpponentMessageTime)
	}

	const toggleChat = () => {
		settings.showChatWindow
			? dispatch({
					type: localMessages.SETTINGS_SET,
					setting: {
						key: 'showChatWindow',
						value: false,
					},
				})
			: dispatch({
					type: localMessages.SETTINGS_SET,
					setting: {
						key: 'showChatWindow',
						value: true,
					},
				})
	}

	const newMessage =
		!settings.showChatWindow &&
		lastSeen !== latestOpponentMessageTime &&
		latestOpponentMessageTime !== 0

	return (
		<button
			className={classnames(css.item, css.clickable, {
				[css.newMessage]: newMessage,
			})}
			title="Chat (C)"
			onClick={toggleChat}
		>
			{newMessage ? <ChatIconNotify /> : <ChatIcon />}
		</button>
	)
}

export default ChatItem
