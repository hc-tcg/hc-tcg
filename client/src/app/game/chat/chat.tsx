import {SyntheticEvent} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import classnames from 'classnames'
import {getChatMessages, getPlayerStates} from 'logic/game/game-selectors'
import {chatMessage} from 'logic/game/game-actions'
import {getPlayerId} from 'logic/session/session-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import css from './chat.module.css'
import Button from 'components/button'

function Chat() {
	const dispatch = useDispatch()
	const chatMessages = useSelector(getChatMessages)
	const playerStates = useSelector(getPlayerStates)
	const playerId = useSelector(getPlayerId)
	const settings = useSelector(getSettings)

	if (settings.showChat !== 'on') return null

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

	console.log('Chat messages:', chatMessages)

	return (
		<div className={css.chat}>
			<div className={css.messageList}>
				{chatMessages
					.slice()
					.reverse()
					.map((messageInfo) => {
						const time = new Date(messageInfo.createdAt).toLocaleString()
						const hmTime = new Date(messageInfo.createdAt).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						})
						const name = playerStates?.[messageInfo.playerId]?.playerName || 'unknown'
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
								<span className={css.time}>{hmTime}</span>
								<span className={css.playerName}>{name}</span>
								<span className={css.text}>
									{/* :&nbsp; */}
									{settings.profanityFilter !== 'off'
										? messageInfo.censoredMessage
										: messageInfo.message}
								</span>
							</div>
						)
					})}
			</div>

			<form className={css.publisher} onSubmit={handleNewMessage}>
				<input
					style={{height: '2rem'}}
					autoComplete="off"
					autoFocus
					name="message"
					maxLength={140}
				/>
				<Button variant="default" size="small" style={{height: '2rem'}}>
					Send
				</Button>
			</form>
		</div>
	)
}

export default Chat
