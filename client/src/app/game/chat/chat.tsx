import {useState, SyntheticEvent} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import classnames from 'classnames'
import {getChatMessages, getPlayerStates} from 'logic/game/game-selectors'
import {chatMessage} from 'logic/game/game-actions'
import {getPlayerId} from 'logic/session/session-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import css from './chat.module.css'

function Chat() {
	const dispatch = useDispatch()
	const [showChat, setShowChat] = useState<boolean>(false)
	const [lastSeen, setLastSeen] = useState<number>(0)
	const chatMessages = useSelector(getChatMessages)
	const playerStates = useSelector(getPlayerStates)
	const playerId = useSelector(getPlayerId)
	const settings = useSelector(getSettings)
	const latestMessageTime = chatMessages[0]?.createdAt || 0

	if (!showChat) {
		return (
			<div
				className={classnames(css.showChat, {
					[css.newMessage]: lastSeen !== latestMessageTime,
				})}
			>
				<button onClick={() => setShowChat(true)}>{'>'}</button>
				<div className={css.indicator} />
			</div>
		)
	}

	const handleNewMessage = (ev: SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const form = ev.currentTarget
		const messageEl = form.message as HTMLInputElement
		const message = messageEl.value.trim()
		messageEl.value = ''
		messageEl.focus()
		if (message.length === 0) return
		dispatch(chatMessage(message))
	}

	const hideChat = () => {
		setShowChat(false)
		setLastSeen(chatMessages[0]?.createdAt || 0)
	}

	return (
		<div className={css.chat}>
			<form className={css.publisher} onSubmit={handleNewMessage}>
				<input autoComplete="off" autoFocus name="message" maxLength={140} />
				<button>Send</button>
				<button type="button" onClick={hideChat}>
					{'<'}
				</button>
			</form>
			<div className={css.messageList}>
				{chatMessages.map((messageInfo) => {
					const time = new Date(messageInfo.createdAt).toLocaleString()
					const name =
						playerStates?.[messageInfo.playerId]?.playerName || 'unknown'
					const isPlayer = playerId === messageInfo.playerId
					return (
						<div
							key={messageInfo.createdAt}
							className={classnames(css.message, {
								[css.player]: isPlayer,
								[css.opponent]: !isPlayer,
							})}
							title={time}
						>
							<span className={css.playerName}>{name}</span>
							<span className={css.text}>
								:&nbsp;
								{settings.profanityFilter !== 'off'
									? messageInfo.censoredMessage
									: messageInfo.message}
							</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default Chat
