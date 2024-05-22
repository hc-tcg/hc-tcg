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
	const settings = useSelector(getSettings)
	const chatMessages = settings.disableChat === 'off' ? useSelector(getChatMessages) : []
	const playerStates = useSelector(getPlayerStates)
	const playerId = useSelector(getPlayerId)
	const opponent = useSelector(getOpponentName)
	const chatPos = settings.chatPosition
	const chatSize = settings.chatSize
	const showLog = settings.showBattleLogs

	const bindChatPos = useDrag((params: any) => {
		dispatch(
			setSetting('chatPosition', {
				x: params.offset[0],
				y: params.offset[1],
			})
		)
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
			style={{
				top: chatPos.y,
				left: chatPos.x,
				width: chatSize.w !== 0 ? chatSize.w : '94vw',
				height: chatSize.h !== 0 ? chatSize.h : '50vh',
			}}
			onClick={(e) => {
				console.log(e)
				dispatch(
					setSetting('chatSize', {
						w: e.currentTarget.offsetWidth,
						h: e.currentTarget.offsetHeight,
					})
				)
			}}
		>
			<div className={css.header} {...bindChatPos()}>
				<p>Chatting with {opponent}</p>
				<Button onClick={() => dispatch(setSetting('showBattleLogs', !showLog))} size="small">
					{showLog ? 'Hide Battle Log' : 'Show Battle Log'}
				</Button>
				<button onClick={closeChat} className={css.close}>
					<img src="/images/CloseX.svg" alt="close" />
				</button>
			</div>

			<div className={css.messagesWrapper}>
				<div className={css.messages}>
					{chatMessages.slice().map((msg) => {
						if (msg.systemMessage && !showLog) return
						const time = new Date(msg.createdAt).toLocaleString()
						const hmTime = new Date(msg.createdAt).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						})
						const isPlayer = playerId === msg.playerId
						const name = playerStates?.[msg.playerId]?.playerName || 'unknown'
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
								{!msg.systemMessage && <span className={css.playerName}>{name}</span>}
								{msg.message.map((segment) => {
									if (segment.format === 'image') {
										return <img className={css.emoji} src={segment.text} alt={segment.alt}></img>
									}
									if (
										segment.condition === undefined ||
										(segment.condition === 'player' && isPlayer) ||
										(segment.condition === 'opponent' && !isPlayer)
									)
										return (
											<span
												className={classnames({
													[css.text]: !msg.systemMessage,
													[css.entryTooltip]: msg.systemMessage,
													[css.highlight]: segment.format === 'highlight',
													[css.player]:
														(segment.format === 'player' && isPlayer) ||
														(segment.format === 'opponent' && !isPlayer),
													[css.opponent]:
														(segment.format === 'opponent' && isPlayer) ||
														(segment.format === 'player' && !isPlayer),
												})}
											>
												{settings.profanityFilter === 'on' ? segment.censoredText : segment.text}
											</span>
										)
								})}
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
