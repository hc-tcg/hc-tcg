import {useDrag} from '@use-gesture/react'
import classNames from 'classnames'
import {FormattedTextNode} from 'common/utils/formatting'
import Button from 'components/button'
import {FormattedText} from 'components/formatting/formatting'
import {
	getChatMessages,
	getGameState,
	getIsSpectator,
	getOpponentName,
	getPlayerEntity,
} from 'logic/game/game-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {getPlayerId, getPlayerName} from 'logic/session/session-selectors'
import {SyntheticEvent, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import css from './chat.module.scss'

function clamp(n: number, min: number, max: number): number {
	return Math.max(Math.min(n, max), min)
}

function Chat() {
	const dispatch = useMessageDispatch()
	const settings = useSelector(getSettings)
	const chatMessages = settings.chatEnabled ? useSelector(getChatMessages) : []
	const playerId = useSelector(getPlayerId)
	const playerEntity = useSelector(getPlayerEntity)
	const playerName = useSelector(getPlayerName)
	const opponentName = useSelector(getOpponentName)
	const chatPosSetting = settings.chatPosition
	const chatSize = settings.chatSize
	const showLog = settings.showBattleLogs
	const isSpectator = useSelector(getIsSpectator)
	const players = useSelector(getGameState)?.players
	const order = useSelector(getGameState)?.order || []

	const viewingFromMobile = window.innerHeight > window.innerWidth

	// If the chat menu was opened previously, lets make sure it is off at the start of the game.
	useEffect(() => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'showChatWindow',
				value: false,
			},
		})
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
			dispatch({
				type: localMessages.SETTINGS_SET,
				setting: {
					key: 'chatPosition',
					value: {
						x: chatPosSetting.x + chatPos.x,
						y: chatPosSetting.y + chatPos.y,
					},
				},
			})
			setChatPos({
				x: 0,
				y: 0,
			})
		}
	})

	if (!settings.showChatWindow) return null

	const handleNewMessage = (ev: SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const form = ev.currentTarget
		const messageEl = form.message as HTMLInputElement
		const chatMessage = messageEl.value.trim()
		messageEl.value = ''
		messageEl.focus()
		if (chatMessage.length === 0) return
		dispatch({type: localMessages.CHAT_MESSAGE, message: chatMessage})
	}

	const closeChat = () => {
		dispatch({
			type: localMessages.SETTINGS_SET,
			setting: {
				key: 'showChatWindow',
				value: false,
			},
		})
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
				dispatch({
					type: localMessages.SETTINGS_SET,
					setting: {
						key: 'chatSize',
						value: {
							w: e.currentTarget.offsetWidth,
							h: e.currentTarget.offsetHeight,
						},
					},
				})
			}}
		>
			<div className={css.header} {...bindChatPos()}>
				<p>Chatting with {opponentName}</p>
				<Button
					onClick={() =>
						dispatch({
							type: localMessages.SETTINGS_SET,
							setting: {
								key: 'showBattleLogs',
								value: !showLog,
							},
						})
					}
					size="small"
				>
					{showLog ? 'Hide Battle Log' : 'Show Battle Log'}
				</Button>
				<button onClick={closeChat} className={css.close}>
					<img src="/images/CloseX.svg" alt="close" />
				</button>
			</div>
			<ChatContent
				chatMessages={chatMessages.map((line) => {
					let isOpponent: boolean
					if (isSpectator) {
						isOpponent =
							!!players &&
							[order[1], players[order[1]]?.playerId].includes(line.sender.id)
					} else {
						isOpponent = ![playerId, playerEntity].includes(line.sender.id)
					}

					let sender: 'playerOne' | 'playerTwo' = isOpponent
						? 'playerTwo'
						: 'playerOne'

					return {
						message: line.message,
						sender,
						createdAt: line.createdAt,
						isBattleLogMessage: line.sender.type === 'system',
					}
				})}
				showLog={showLog}
				profanityFilterEnabled={settings.profanityFilterEnabled}
				isSpectating={isSpectator}
				playerNames={[playerName, opponentName]}
			/>
			<form className={css.publisher} onSubmit={handleNewMessage}>
				<input autoComplete="off" autoFocus name="message" maxLength={140} />
				<Button variant="default" size="small">
					Send
				</Button>
			</form>
		</div>
	)
}

export type ChatMessageDisplay = {
	message: FormattedTextNode
	isBattleLogMessage: boolean
	sender: 'playerOne' | 'playerTwo'
	createdAt: number
}

type ChatContentProps = {
	chatMessages: Array<ChatMessageDisplay>
	showLog: boolean
	profanityFilterEnabled: boolean
	isSpectating: boolean
	playerNames: [string?, string?]
}

export const ChatContent = ({
	chatMessages,
	showLog,
	profanityFilterEnabled,
	isSpectating,
	playerNames,
}: ChatContentProps) => {
	return (
		<div className={css.messagesWrapper}>
			<div className={css.messages}>
				{chatMessages.slice().map((line, lineNumber) => {
					if (line.isBattleLogMessage && showLog === false) return <span></span>
					const hmTime = new Date(line.createdAt).toLocaleTimeString([], {
						hour: '2-digit',
						minute: '2-digit',
					})

					if (line.message.TYPE === 'LineNode') {
						if (isSpectating) {
							return (
								<div className={css.message} key={lineNumber}>
									<span className={css.turnTag}>
										{FormattedText(line.message, {
											isOpponent: line.sender === 'playerTwo',
											isSelectable: false,
										})}
										{line.sender === 'playerOne' &&
											playerNames[0]?.toLocaleUpperCase()}
										'S
										{line.sender === 'playerTwo' &&
											playerNames[1]?.toLocaleUpperCase()}
										{' TURN'}
									</span>
									<span className={css.line}></span>
								</div>
							)
						}

						return (
							<div className={css.message} key={lineNumber}>
								<span className={css.turnTag}>
									{line.sender === 'playerOne' && 'YOUR'}
									{line.sender === 'playerTwo' &&
										playerNames[1]?.toLocaleUpperCase()}
									{' TURN'}
								</span>
								<span className={css.line}></span>
							</div>
						)
					}

					return (
						<div className={css.message} key={lineNumber}>
							<span className={css.time}>{hmTime}</span>
							<span
								className={classNames(
									line.isBattleLogMessage ? css.systemMessage : css.text,
								)}
							>
								{FormattedText(line.message, {
									isOpponent: line.sender === 'playerTwo' || isSpectating,
									color: line.sender === 'playerOne' ? 'blue' : 'orange',
									isSelectable: true,
									censorProfanity: profanityFilterEnabled,
								})}
							</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default Chat
