import classnames from 'classnames'
import ChatIcon from 'components/svgs/ChatIcon'
import ChatIconNotify from 'components/svgs/ChatIconNotify'
import {getChatMessages, getOpponentId} from 'logic/game/game-selectors'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import css from './toolbar.module.scss'

function ChatItem() {
	const chatMessages = useSelector(getChatMessages)
	const settings = useSelector(getSettings)
	const opponentId = useSelector(getOpponentId)
	const latestOpponentMessageTime =
		chatMessages.filter((msg) => {
			return msg.sender === opponentId && msg.systemMessage === false
		})[0]?.createdAt || 0
	const [lastSeen, setLastSeen] = useState<number>(latestOpponentMessageTime)
	const dispatch = useDispatch()

	if (settings.showChat === 'on' && lastSeen !== latestOpponentMessageTime) {
		setLastSeen(latestOpponentMessageTime)
	}

	const toggleChat = () => {
		settings.showChat === 'on'
			? dispatch(setSetting('showChat', 'off'))
			: dispatch(setSetting('showChat', 'on'))
	}

	const newMessage =
		settings.showChat !== 'on' &&
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
