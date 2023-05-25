import css from './toolbar.module.scss'
import {useState} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import classnames from 'classnames'
import {getChatMessages} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import ChatIcon from 'components/svgs/ChatIcon'
import ChatIconNotify from 'components/svgs/ChatIconNotify'

function ChatItem() {
	const [lastSeen, setLastSeen] = useState<number>(0)
	const chatMessages = useSelector(getChatMessages)
	const settings = useSelector(getSettings)
	const latestMessageTime = chatMessages[0]?.createdAt || 0
	const dispatch = useDispatch()

	const toggleChat = () => {
		if (settings.showChat === 'on') {
			dispatch(setSetting('showChat', 'off'))
			setLastSeen(chatMessages[0]?.createdAt || 0)
		} else {
			dispatch(setSetting('showChat', 'on'))
		}
	}

	const newMessage = settings.showChat !== 'on' && lastSeen !== latestMessageTime

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
