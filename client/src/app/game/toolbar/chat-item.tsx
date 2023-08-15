import css from './toolbar.module.scss'
import {useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import classnames from 'classnames'
import {getChatMessages} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import ChatIcon from 'components/svgs/ChatIcon'
import ChatIconNotify from 'components/svgs/ChatIconNotify'
import {getPlayerId} from 'logic/session/session-selectors'

function ChatItem() {
	const chatMessages = useSelector(getChatMessages)
	const settings = useSelector(getSettings)
	const playerId = useSelector(getPlayerId)
	const latestOpponentMessageTime =
		chatMessages.filter((msg) => {
			return msg.playerId === playerId
		})[0]?.createdAt || 0
	const [lastSeen, setLastSeen] = useState<number>(latestOpponentMessageTime)
	const dispatch = useDispatch()

	const toggleChat = () => {
		setLastSeen(latestOpponentMessageTime)

		settings.showChat === 'on'
			? dispatch(setSetting('showChat', 'off'))
			: dispatch(setSetting('showChat', 'on'))
	}

	const newMessage = settings.showChat !== 'on' && lastSeen !== latestOpponentMessageTime

	return (
		<button
			className={classnames(css.item, css.clickable, {
				[css.newMessage]: newMessage,
			})}
			title="Chat"
			onClick={toggleChat}
		>
			{newMessage ? <ChatIconNotify /> : <ChatIcon />}
		</button>
	)
}

export default ChatItem
