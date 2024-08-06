import {useDrag} from '@use-gesture/react'
import classNames from 'classnames'
import Button from 'components/button'
import {FormattedText} from 'components/formatting/formatting'
import {getChatMessages, getOpponentName} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {getPlayerId} from 'logic/session/session-selectors'
import {SyntheticEvent, useEffect, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import css from './chat.module.scss'
import {message} from 'common/redux-actions'
import {Action, actions} from 'logic/actions'

function clamp(n: number, min: number, max: number): number {
	return Math.max(Math.min(n, max), min)
}

function Chat() {
	const dispatch = useDispatch()
	const settings = useSelector(getSettings)
	const chatMessages =
		settings.disableChat === 'off' ? useSelector(getChatMessages) : []
	const playerId = useSelector(getPlayerId)
	const opponentName = useSelector(getOpponentName)
	const chatPosSetting = settings.chatPosition
	const chatSize = settings.chatSize
	const showLog = settings.showBattleLogs

	const viewingFromMobile = window.innerHeight > window.innerWidth

	// If the chat menu was opened previously, lets make sure it is off at the start of the game.
	useEffect(() => {
		dispatch(
			message<Action>({
				type: actions.SETTINGS_SET,
				key: 'showChat',
				value: 'off',
			}),
		)
	}, [])

	const [chatPos, setChatPos] = useState({x: 0, y: 0})

	const bindChatPos = useDrag((params: any) => {
		// When on mobile the chat uses a different size. Dragging it causes the mobile size to saved
		// which feels buggy.
		if (viewingFromMobile) return

		const {innerWidth: width, innerHeight: height} = window
		let [x, y] = params.movement

		x = clamp(x, -chatPosSetting.x, width - chatPosSetting.x - chatSize.w)
		y = clamp(y, -chatPosSetting.y, height - chatPosSetting.y - chatSize.h)

		setChatPos({
			x,
			y,
		})

		if (!params.pressed) {
			dispatch(
				message<Action>({
					type: actions.SETTINGS_SET,
					key: 'chatPosition',
					value: {
						x: chatPosSetting.x + chatPos.x,
						y: chatPosSetting.y + chatPos.y,
					},
				}),
			)
			setChatPos({
				x: 0,
				y: 0,
			})
		}
	})

	if (settings.showChat !== 'on') return null

	const handleNewMessage = (ev: SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const form = ev.currentTarget
		const messageEl = form.message as HTMLInputElement
		const chatMessage = messageEl.value.trim()
		messageEl.value = ''
		messageEl.focus()
		if (chatMessage.length === 0) return
		dispatch(
			message<Action>({type: actions.CHAT_MESSAGE, message: chatMessage}),
		)
	}

	const closeChat = () => {
		dispatch(
			message<Action>({
				type: actions.SETTINGS_SET,
				key: 'showChat',
				value: 'off',
			}),
		)
	}

	// @TODO: Repopulate chat messages after reconnecting

	let style = {
		top: chatPos.y + chatPosSetting.y,
		left: chatPos.x + chatPosSetting.x,
		width: chatSize.w !== 0 ? chatSize.w : '94vw',
		height: chatSize.h !== 0 ? chatSize.h : '50vh',
	}

	if (viewingFromMobile) {
		style.top = 0
		style.left = 0
		style.width = '100%'
		style.height = '100%'
	}

	return (
		<div
			className={css.chat}
			style={style}
			onClick={(e) => {
				dispatch(
					message<Action>({
						type: actions.SETTINGS_SET,
						key: 'chatSize',
						value: {
							w: e.currentTarget.offsetWidth,
							h: e.currentTarget.offsetHeight,
						},
					}),
				)
			}}
		>
			<div className={css.header} {...bindChatPos()}>
				<p>Chatting with {opponentName}</p>
				<Button
					onClick={() =>
						dispatch(
							message<Action>({
								type: actions.SETTINGS_SET,
								key: 'showBattleLogs',
								value: !showLog,
							}),
						)
					}
					size="small"
				>
					{showLog ? 'Hide Battle Log' : 'Show Battle Log'}
				</Button>
				<button onClick={closeChat} className={css.close}>
					<img src="/images/CloseX.svg" alt="close" />
				</button>
			</div>

			<div className={css.messagesWrapper}>
				<div className={css.messages}>
					{chatMessages.slice().map((line) => {
						if (line.sender.type === 'system' && showLog === false)
							return <span></span>
						const hmTime = new Date(line.createdAt).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						})

						const isOpponent = playerId !== line.sender.id
						if (line.message.TYPE === 'LineNode') {
							return (
								<div className={css.message}>
									<span className={css.turnTag}>
										{isOpponent
											? `${opponentName}'s`.toLocaleUpperCase()
											: 'YOUR'}{' '}
										TURN
									</span>
									<span className={css.line}></span>
								</div>
							)
						}

						return (
							<div className={css.message}>
								<span className={css.time}>{hmTime}</span>
								<span
									className={classNames(
										line.sender.type === 'system'
											? css.systemMessage
											: css.text,
									)}
								>
									{FormattedText(line.message, {
										isOpponent,
										censorProfanity: settings.profanityFilter === 'on',
									})}
								</span>
							</div>
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
