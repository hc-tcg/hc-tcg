import {SyntheticEvent, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import classnames from 'classnames'
import {getChatMessages, getOpponentName, getPlayerStates} from 'logic/game/game-selectors'
import {chatMessage} from 'logic/game/game-actions'
import {getPlayerId} from 'logic/session/session-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import css from './chat.module.scss'
import Button from 'components/button'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {useDrag} from '@use-gesture/react'

function Chat() {
	const dispatch = useDispatch()
	const chatMessages = useSelector(getChatMessages)
	const playerStates = useSelector(getPlayerStates)
	const playerId = useSelector(getPlayerId)
	const settings = useSelector(getSettings)
	const opponent = useSelector(getOpponentName)
	const [chatPos, setChatPos] = useState({x: 0, y: 0})

	const bindChatPos = useDrag((params: any) => {
		setChatPos({
			x: params.offset[0],
			y: params.offset[1],
		})
	})

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

	const closeChat = () => {
		dispatch(setSetting('showChat', 'off'))
	}

	// @TODO: Repopulate chat messages after reconnecting
	return (
		<div
			className={css.chat}
			style={{top: chatPos.y, left: chatPos.x, width: '94vw', height: '50vh'}}
		>
			<div className={css.header} {...bindChatPos()}>
				<p>Chatting with {opponent}</p>
				<button onClick={closeChat}>
					<img src="/images/CloseX.svg" alt="close" />
				</button>
			</div>

			<div className={css.messagesWrapper}>
				<div className={css.messages}>
					{chatMessages
						.slice()
						.reverse()
						.map((msg) => {
							const time = new Date(msg.createdAt).toLocaleString()
							const hmTime = new Date(msg.createdAt).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
							})
							const name = playerStates?.[msg.playerId]?.playerName || 'unknown'
							const isPlayer = playerId === msg.playerId
							return (
								<p
									key={msg.createdAt}
									className={classnames(css.message, {
										[css.player]: isPlayer,
										[css.opponent]: !isPlayer,
									})}
									title={time}
								>
									<span className={css.time}>{hmTime}</span>
									<span className={css.playerName}>{name}</span>
									<span className={css.text}>
										{settings.profanityFilter !== 'off' ? msg.censoredMessage : msg.message}
									</span>
								</p>
							)
						})}
				</div>
			</div>

			<form className={css.publisher} onSubmit={handleNewMessage}>
				<input autoComplete="off" autoFocus name="message" maxLength={140} />
				<Button variant="default" size="small">
					Send
				</Button>
			</form>
		</div>
	)
}

export default Chat
