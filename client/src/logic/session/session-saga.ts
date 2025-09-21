import {ACHIEVEMENTS} from 'common/achievements'
import {getStarterPack} from 'common/cards/starter-decks'
import {CONFIG, VERSION} from 'common/config'
import {BACKGROUNDS} from 'common/cosmetics/backgrounds'
import {BORDERS} from 'common/cosmetics/borders'
import {COINS} from 'common/cosmetics/coins'
import {defaultAppearance} from 'common/cosmetics/default'
import {HEARTS} from 'common/cosmetics/hearts'
import {TITLES} from 'common/cosmetics/titles'
import {Appearance} from 'common/cosmetics/types'
import {PlayerId} from 'common/models/player-model'
import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {User} from 'common/types/database'
import {Deck, Tag} from 'common/types/deck'
import {PlayerInfo} from 'common/types/server-requests'
import {toLocalCardInstance} from 'common/utils/cards'
import {generateDatabaseCode} from 'common/utils/database-codes'
import {
	getAchievements,
	getAppearance,
	getLocalDatabaseInfo,
} from 'logic/game/database/database-selectors'
import gameSaga from 'logic/game/game-saga'
import {getMatchmaking} from 'logic/matchmaking/matchmaking-selectors'
import {LocalMessage, LocalMessageTable, localMessages} from 'logic/messages'
import {
	deleteDeckFromLocalStorage,
	getActiveDeckCode,
	getLocalStorageDecks,
	saveDeckToLocalStorage,
} from 'logic/saved-decks/saved-decks'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {getSocket} from 'logic/socket/socket-selectors'
import {eventChannel} from 'redux-saga'
import {call, delay, put, race, select, take, takeEvery} from 'typed-redux-saga'
import {BASE_URL} from '../../constants'
import {ConnectionError} from './session-reducer'
export const NO_SOCKET_ASSERT =
	'The socket should be be defined as soon as the page is opened.'

const loadSession = () => {
	const playerName = sessionStorage.getItem('playerName')
	const censoredPlayerName = sessionStorage.getItem('censoredPlayerName')
	const playerId = sessionStorage.getItem('playerId') as PlayerId
	const playerSecret = sessionStorage.getItem('playerSecret')

	if (!playerName || !censoredPlayerName || !playerId || !playerSecret)
		return null
	return {
		playerName,
		censoredPlayerName,
		playerId,
		playerSecret,
	}
}

const saveSession = (playerInfo: PlayerInfo) => {
	sessionStorage.setItem('playerName', playerInfo.playerName)
	sessionStorage.setItem('censoredPlayerName', playerInfo.playerName)
	sessionStorage.setItem('playerId', playerInfo.playerId)
	sessionStorage.setItem('playerSecret', playerInfo.playerSecret)
}

const clearSession = () => {
	sessionStorage.removeItem('playerName')
	sessionStorage.removeItem('censoredPlayerName')
	sessionStorage.removeItem('playerId')
	sessionStorage.removeItem('playerSecret')
}

const getClientVersion = (): string => {
	return VERSION || 'dev'
}

const createConnectErrorChannel = (socket: any) =>
	eventChannel((emit) => {
		const connectErrorListener = (err: Error | null) => {
			if (err instanceof Error) return emit(err.message)
			if (typeof err === 'string') return emit(err)
			console.error(err)
		}
		socket.on('connect_error', connectErrorListener)
		return () => socket.off('connect_error', connectErrorListener)
	})

function getNonDatabaseUser(): User {
	const playerName = localStorage.getItem('playerName')
	return {
		uuid: Math.random().toString(),
		secret: Math.random().toString(),
		username: playerName || 'Steve',
		minecraftName: 'steve',
		title: null,
		coin: null,
		heart: null,
		background: null,
		border: null,
		decks: getLocalStorageDecks(),
		achievements: {
			achievementData: {},
		},
		stats: {
			gamesPlayed: 0,
			wins: 0,
			losses: 0,
			ties: 0,
			forfeitWins: 0,
			forfeitLosses: 0,
			uniquePlayersEncountered: 0,
			topCards: [],
			playtime: {
				hours: 0,
				minutes: 0,
				seconds: 0,
			},
		},
		gameHistory: [],
		banned: false,
	}
}

function* authenticateUser(
	playerUuid: string,
	secret: string,
): Generator<any, User | null> {
	const headers = {
		userId: playerUuid,
		secret: secret,
	}

	const auth = yield* call(fetch, `${BASE_URL}/api/auth/`, {
		headers,
	})

	console.log(auth)

	if (auth.status === 500) {
		yield* put<LocalMessage>({
			type: localMessages.DATABASE_SET,
			data: {
				key: 'noConnection',
				value: true,
			},
		})
		return getNonDatabaseUser()
	}

	// Authentication failed
	if (auth.status === 401) {
		return null
	}

	const userResponse = (yield* call([auth, auth.json])) as User
	return userResponse
}

function* createUser(username: string): Generator<any, User> {
	const headers = {
		username: username,
	}

	const userInfo = yield* call(fetch, `${BASE_URL}/api/createUser/`, {
		method: 'POST',
		headers,
	})

	if (userInfo.status === 500) {
		const user = getNonDatabaseUser()
		yield* put<LocalMessage>({
			type: localMessages.DATABASE_SET,
			data: {
				key: 'noConnection',
				value: true,
			},
		})
		if (user.decks.length === 0) {
			const starterDeck = getStarterPack()
			const newDeck: Deck = {
				name: 'Starter Deck',
				icon: starterDeck.icon,
				iconType: 'item',
				cards: starterDeck.cards.map((card) => toLocalCardInstance(card)),
				code: generateDatabaseCode(),
				public: false,
				tags: [],
			}
			user.decks.push(newDeck)
			saveDeckToLocalStorage(newDeck)
		}
		return user
	}

	const userResponse = (yield* call([userInfo, userInfo.json])) as User
	return userResponse
}

export function* setupData(user: User) {
	// Setup database info
	const appearance: Appearance = {
		title: TITLES[user.title || ''] ?? defaultAppearance.title,
		coin: COINS[user.coin || ''] ?? defaultAppearance.coin,
		heart: HEARTS[user.heart || ''] ?? defaultAppearance.heart,
		background:
			BACKGROUNDS[user.background || ''] ?? defaultAppearance.background,
		border: BORDERS[user.border || ''] ?? defaultAppearance.border,
	}

	console.log(appearance)

	yield* put<LocalMessage>({
		type: localMessages.DATABASE_SET,
		data: {
			key: 'decks',
			value: user.decks,
		},
	})

	const allTags = user.decks.reduce((r: Array<Tag>, deck) => {
		r.push(...deck.tags)
		return r
	}, [])

	yield* put<LocalMessage>({
		type: localMessages.DATABASE_SET,
		data: {
			key: 'tags',
			value: allTags
				.reduce((r: Array<Tag>, d) => {
					if (r.find((a) => a.key === d.key)) return r
					r.push(d)
					return r
				}, [])
				.sort((a, b) => a.name.localeCompare(b.name)),
		},
	})
	yield* put<LocalMessage>({
		type: localMessages.DATABASE_SET,
		data: {
			key: 'achievements',
			value: user.achievements.achievementData,
		},
	})
	yield* put<LocalMessage>({
		type: localMessages.DATABASE_SET,
		data: {
			key: 'gameHistory',
			value: user.gameHistory,
		},
	})
	yield* put<LocalMessage>({
		type: localMessages.DATABASE_SET,
		data: {
			key: 'stats',
			value: user.stats,
		},
	})
	yield* put<LocalMessage>({
		type: localMessages.COSMETICS_SET,
		appearance: appearance,
	})

	// Set active deck
	const activeDeckCode = getActiveDeckCode()
	const activeDeck = user.decks.find((deck) => deck.code === activeDeckCode)
	if (activeDeck && activeDeck.code) {
		yield* put<LocalMessage>({
			type: localMessages.SELECT_DECK,
			deck: activeDeck,
		})
	}

	yield* put<LocalMessage>({
		type: localMessages.USERNAME_SET,
		name: user.username,
	})

	yield* put<LocalMessage>({
		type: localMessages.MINECRAFT_NAME_SET,
		name: user.minecraftName ? user.minecraftName : user.username,
	})
}

type LoginResult =
	| {
			success: true
	  }
	| {
			success: false
			reason: ConnectionError
	  }

function* trySingleLoginAttempt(): Generator<any, LoginResult, any> {
	const socket = yield* select(getSocket)
	const session = loadSession()

	if (!socket) throw Error(NO_SOCKET_ASSERT)

	console.log('session saga: ', session)

	let playerEnteredCredentials = false

	if (!session) {
		let secret = localStorage.getItem('databaseInfo:secret')
		let userId = localStorage.getItem('databaseInfo:userId')

		if (!secret || !userId) {
			// Create a new user here
			yield* put<LocalMessage>({type: localMessages.NOT_CONNECTING})

			const loginMessage = yield* take<
				LocalMessageTable[typeof localMessages.LOGIN]
			>(localMessages.LOGIN)

			if (loginMessage.login_type === 'new-account') {
				const {name} = loginMessage

				localStorage.setItem('playerName', name)

				const userResponse = yield* createUser(name)

				yield* put<LocalMessage>({
					type: localMessages.SET_ID_AND_SECRET,
					userId: userResponse.uuid,
					secret: userResponse.secret,
				})

				yield* put<LocalMessage>({
					type: localMessages.SELECT_DECK,
					deck: userResponse.decks[0],
				})
				localStorage.setItem('activeDeck', userResponse.decks[0].code)

				socket.auth = {
					...socket.auth,
					playerUuid: userResponse.uuid,
					playerName: userResponse.username,
					minecraftName: userResponse.minecraftName || userResponse.username,
					appearance: defaultAppearance,
					version: getClientVersion(),
				}
				yield* put<LocalMessage>({type: localMessages.SOCKET_CONNECTING})
				socket.connect()

				yield* setupData(userResponse)
			} else {
				playerEnteredCredentials = true
				userId = loginMessage.uuid
				secret = loginMessage.secret
			}
		}

		if (userId && secret) {
			const userResponse = yield* authenticateUser(userId, secret)

			yield* put<LocalMessage>({
				type: localMessages.CONNECTING_MESSAGE,
				message: 'Authenticating',
			})

			if (!userResponse) {
				return {
					success: false,
					reason: playerEnteredCredentials
						? 'invalid_auth_entered'
						: 'bad_auth',
				}
			}

			socket.auth = {
				...socket.auth,
				playerUuid: userResponse.uuid,
				playerName: userResponse.username,
				minecraftName: userResponse.minecraftName || userResponse.username,
				appearance: {
					title: TITLES[userResponse.title || ''] ?? defaultAppearance.title,
					coin: COINS[userResponse.coin || ''] ?? defaultAppearance.coin,
					heart: HEARTS[userResponse.heart || ''] ?? defaultAppearance.heart,
					background:
						BACKGROUNDS[userResponse.background || ''] ??
						defaultAppearance.background,
					border:
						BORDERS[userResponse.border || ''] ?? defaultAppearance.border,
				},
				version: getClientVersion(),
			}
			yield* put<LocalMessage>({type: localMessages.SOCKET_CONNECTING})
			socket.connect()

			yield* setupData(userResponse)
		}
	} else {
		yield* put<LocalMessage>({
			type: localMessages.CONNECTING_MESSAGE,
			message: 'Reconnecting',
		})

		socket.auth = {...socket.auth, ...session, version: getClientVersion()}
		yield* put<LocalMessage>({type: localMessages.SOCKET_CONNECTING})
		socket.connect()
	}

	const connectErrorChan = createConnectErrorChannel(socket)

	const result = yield* race({
		playerInfo: call(receiveMsg(socket, serverMessages.PLAYER_INFO)),
		invalidPlayer: call(receiveMsg(socket, serverMessages.INVALID_PLAYER)),
		playerReconnected: call(
			receiveMsg(socket, serverMessages.PLAYER_RECONNECTED),
		),
		connectError: take(connectErrorChan),
		timeout: delay(8000),
	})

	if (result.invalidPlayer || result.connectError) {
		console.log('HERE')
		yield* put<LocalMessage>({
			type: localMessages.CONNECTING_MESSAGE,
			message: 'Connection Error. Reloading',
		})

		clearSession()
		socket.disconnect()

		return {
			success: false,
			reason: 'invalid_session',
		}
	}

	if (result.timeout) {
		clearSession()
		socket.disconnect()
		return {
			success: false,
			reason: 'timeout',
		}
	}

	window.history.replaceState({}, '', window.location.pathname)

	if (result.playerReconnected) {
		if (!session)
			throw new Error('The session should ALWAYS exist if the user logged in.')

		const secret = localStorage.getItem('databaseInfo:secret')
		const userId = localStorage.getItem('databaseInfo:userId')

		if (!userId) {
			throw new Error(
				"Players should not be able to reconnect if they don't have a user ID.",
			)
		}
		if (!secret) {
			throw new Error(
				"Players should not be able to reconnect if they don't have a secret.",
			)
		}

		const userResponse = yield* authenticateUser(userId, secret)
		if (!userResponse) {
			return {
				success: false,
				reason: 'bad_auth',
			}
		}
		yield* setupData(userResponse)

		console.log('User reconnected')
		yield put<LocalMessage>({
			type: localMessages.PLAYER_SESSION_SET,
			player: session,
		})
		yield put<LocalMessage>({
			type: localMessages.CONNECTED,
		})

		if (result.playerReconnected.game) {
			const matchmakingStatus = (yield* select(getMatchmaking)).status

			// Only start a new game saga if the player is not in a game.
			if (matchmakingStatus !== 'in_game') {
				yield* call(gameSaga, {
					initialGameState: result.playerReconnected.game,
					spectatorCode: result.playerReconnected.spectatorCode,
				})
				yield* put<LocalMessage>({type: localMessages.MATCHMAKING_LEAVE})
			}
		}
	}

	if (result.playerInfo) {
		yield put<LocalMessage>({
			type: localMessages.PLAYER_INFO_SET,
			player: result.playerInfo.player,
		})
		saveSession(result.playerInfo.player)

		// set user info for reconnects
		socket.auth = {
			...socket.auth,
			playerUuid: localStorage.getItem('database:userId') as string,
			playerName: result.playerInfo.player.playerName,
			minecraftName:
				result.playerInfo.player.minecraftName ||
				result.playerInfo.player.playerName,
			playerId: result.playerInfo.player.playerId,
			playerSecret: result.playerInfo.player.playerSecret,
		}

		yield put<LocalMessage>({
			type: localMessages.CONNECTED,
		})
	}

	return {success: true}
}

export function* loginSaga() {
	while (true) {
		let result = yield* trySingleLoginAttempt()
		if (result.success === true) {
			break
		}

		// This is a bit janky, but this reloads the client if the version happens to be out of date
		if (
			result.reason === 'invalid_session' ||
			result.reason === 'bad_auth' ||
			result.reason === 'timeout'
		) {
			window.location.reload()
		}

		// Otherwise the login failed, so lets send a toast and try again
		yield put<LocalMessage>({
			type: localMessages.DISCONNECT,
			errorMessage: result.reason,
		})
	}
}

export function* databaseConnectionSaga() {
	const noConnection = (yield* select(getLocalDatabaseInfo) as any)[
		'noConnection'
	]

	yield* takeEvery<LocalMessageTable[typeof localMessages.INSERT_DECK]>(
		localMessages.INSERT_DECK,
		function* (action) {
			if (noConnection) {
				saveDeckToLocalStorage(action.deck)
				return
			}
			yield* sendMsg({type: clientMessages.INSERT_DECK, deck: action.deck})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.UPDATE_DECK]>(
		localMessages.UPDATE_DECK,
		function* (action) {
			if (noConnection) {
				saveDeckToLocalStorage(action.deck)
				return
			}
			yield* sendMsg({type: clientMessages.UPDATE_DECK, deck: action.deck})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.IMPORT_DECK]>(
		localMessages.IMPORT_DECK,
		function* (action) {
			yield* sendMsg({
				type: clientMessages.IMPORT_DECK,
				code: action.code,
				newActiveDeck: action.newActiveDeck,
				newName: action.newName,
				newIcon: action.newIcon,
				newIconType: action.newIconType,
			})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.EXPORT_DECK]>(
		localMessages.EXPORT_DECK,
		function* (action) {
			yield* sendMsg({
				type: clientMessages.EXPORT_DECK,
				code: action.code,
			})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.GRAB_CURRENT_IMPORT]>(
		localMessages.GRAB_CURRENT_IMPORT,
		function* (action) {
			yield* sendMsg({
				type: clientMessages.GRAB_CURRENT_IMPORT,
				code: action.code,
			})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.MAKE_INFO_PUBLIC]>(
		localMessages.MAKE_INFO_PUBLIC,
		function* (action) {
			yield* sendMsg({
				type: clientMessages.MAKE_INFO_PUBLIC,
				code: action.code,
				public: action.public,
			})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.DELETE_DECK]>(
		localMessages.DELETE_DECK,
		function* (action) {
			if (noConnection) {
				deleteDeckFromLocalStorage(action.deck)
				return
			}
			yield* sendMsg({type: clientMessages.DELETE_DECK, deck: action.deck})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.DELETE_TAG]>(
		localMessages.DELETE_TAG,
		function* (action) {
			if (noConnection) return
			yield* sendMsg({type: clientMessages.DELETE_TAG, tag: action.tag})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.UPDATE_DECKS]>(
		localMessages.UPDATE_DECKS,
		function* (action) {
			if (action.newActiveDeck) {
				yield* put<LocalMessage>({
					type: localMessages.SELECT_DECK,
					deck: action.newActiveDeck,
				})
			}
			if (!noConnection) return
			yield* sendMsg({
				type: clientMessages.GET_DECKS,
				newActiveDeck: action.newActiveDeck?.code,
			})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.MINECRAFT_NAME_SET]>(
		localMessages.MINECRAFT_NAME_SET,
		function* (action) {
			yield* sendMsg({
				type: clientMessages.UPDATE_MINECRAFT_NAME,
				name: action.name,
			})
		},
	)
	yield* takeEvery<LocalMessageTable[typeof localMessages.USERNAME_SET]>(
		localMessages.USERNAME_SET,
		function* (action) {
			localStorage.setItem('playerName', action.name)
			sessionStorage.setItem('playerName', action.name)
			sessionStorage.setItem('censoredPlayerName', action.name)
			yield* sendMsg({
				type: clientMessages.UPDATE_USERNAME,
				name: action.name,
			})
		},
	)
}

export function* logoutSaga() {
	const socket = yield* select(getSocket)

	if (!socket) throw new Error(NO_SOCKET_ASSERT)

	yield* race([
		take(localMessages.LOGOUT),
		call(receiveMsg(socket, serverMessages.INVALID_PLAYER)),
	])
	clearSession()
	socket.disconnect()
	delete socket.auth.playerId
	yield put<LocalMessage>({type: localMessages.DISCONNECT})
}

export function* newDecksSaga() {
	const socket = yield* select(getSocket)
	while (true) {
		const result = yield* call(
			receiveMsg(socket, serverMessages.DECKS_RECIEVED),
		)
		yield put<LocalMessage>({
			type: localMessages.DATABASE_SET,
			data: {
				key: 'decks',
				value: result.decks,
			},
		})
		yield put<LocalMessage>({
			type: localMessages.DATABASE_SET,
			data: {
				key: 'tags',
				value: result.tags,
			},
		})
		if (result.newActiveDeck) {
			// Select new active deck
			yield* put<LocalMessage>({
				type: localMessages.SELECT_DECK,
				deck: result.newActiveDeck,
			})
		}
	}
}

export function* newDeckSaga() {
	const socket = yield* select(getSocket)
	while (true) {
		const result = yield* call(receiveMsg(socket, serverMessages.NEW_DECK))

		// Select new active deck
		localStorage.setItem('activeDeck', result.deck.code)
	}
}

export function* recieveCurrentImportSaga() {
	const socket = yield* select(getSocket)
	while (true) {
		const result = yield* call(
			receiveMsg(socket, serverMessages.CURRENT_IMPORT_RECIEVED),
		)
		console.log('recieved')
		yield put<LocalMessage>({
			type: localMessages.DATABASE_SET,
			data: {
				key: 'currentImport',
				value: result.deck,
			},
		})
	}
}

export function* recieveAfterGameInfo() {
	const socket = yield* select(getSocket)
	while (true) {
		const result = yield* race({
			afterGameInfo: call(receiveMsg(socket, serverMessages.AFTER_GAME_INFO)),
			invalidReplay: call(receiveMsg(socket, serverMessages.INVALID_REPLAY)),
			rematchData: call(receiveMsg(socket, serverMessages.SEND_REMATCH)),
			rematchRequested: call(
				receiveMsg(socket, serverMessages.REMATCH_REQUESTED),
			),
			rematchDenied: call(receiveMsg(socket, serverMessages.REMATCH_DENIED)),
		})
		if (result.afterGameInfo) {
			yield put<LocalMessage>({
				type: localMessages.DATABASE_SET,
				data: {
					key: 'stats',
					value: result.afterGameInfo.stats,
				},
			})
			yield put<LocalMessage>({
				type: localMessages.DATABASE_SET,
				data: {
					key: 'gameHistory',
					value: result.afterGameInfo.gameHistory,
				},
			})
			yield put<LocalMessage>({
				type: localMessages.DATABASE_SET,
				data: {
					key: 'achievements',
					value: result.afterGameInfo.achievements.achievementData,
				},
			})
		} else if (result.invalidReplay) {
			yield put<LocalMessage>({
				type: localMessages.DATABASE_SET,
				data: {
					key: 'invalidReplay',
					value: true,
				},
			})
		} else if (result.rematchData) {
			yield* put<LocalMessage>({
				type: localMessages.RECIEVE_REMATCH,
				rematch: result.rematchData.rematch,
			})
		} else if (result.rematchRequested) {
			yield put<LocalMessage>({
				type: localMessages.TOAST_OPEN,
				open: true,
				title: 'Rematch Requested',
				description: `Your last opponent, ${result.rematchRequested.opponentName}, requested a rematch.`,
			})
		} else if (result.rematchDenied) {
			yield* put<LocalMessage>({
				type: localMessages.RECIEVE_REMATCH,
				rematch: null,
			})
		}
	}
}

export function* databaseErrorSaga() {
	const socket = yield* select(getSocket)
	while (true) {
		const result = yield* call(
			receiveMsg(socket, serverMessages.DATABASE_FAILURE),
		)
		console.error(result.error)
	}
}

export function* updatesSaga() {
	const socket = yield* select(getSocket)
	yield sendMsg({type: clientMessages.GET_UPDATES})
	const result = yield* call(receiveMsg(socket, serverMessages.LOAD_UPDATES))
	yield put<LocalMessage>({
		type: localMessages.UPDATES_LOAD,
		updates: result.updates,
	})
}

export function* serverToastSaga() {
	const socket = yield* select(getSocket)
	while (true) {
		const result = yield* call(receiveMsg(socket, serverMessages.TOAST_SEND))
		yield put<LocalMessage>({
			type: localMessages.TOAST_OPEN,
			open: true,
			title: result.title,
			description: result.description,
			image: result.image,
		})
	}
}

export function* cosmeticSaga() {
	yield* takeEvery<LocalMessageTable[typeof localMessages.COSMETIC_UPDATE]>(
		localMessages.COSMETIC_UPDATE,
		function* (action) {
			const socket = yield* select(getSocket)
			const appearance = yield* select(getAppearance)
			const achievementProgress = yield* select(getAchievements)

			const selected = Object.values(appearance)
				.map((cos) => cos.id)
				.includes(action.cosmetic.id)
			let isUnlocked = true
			if (
				action.cosmetic.requires &&
				ACHIEVEMENTS[action.cosmetic.requires.achievement]
			) {
				const achievement = ACHIEVEMENTS[action.cosmetic.requires.achievement]
				isUnlocked =
					!!achievementProgress[achievement.numericId]?.levels[
						action.cosmetic.requires.level || 0
					]?.completionTime
			}
			if (CONFIG.unlockAllCosmetics) isUnlocked = true
			if (!isUnlocked || selected) return
			yield* sendMsg({
				type: clientMessages.SET_COSMETIC,
				cosmetic: action.cosmetic.id,
			})

			const result = yield* race({
				success: call(receiveMsg(socket, serverMessages.COSMETICS_UPDATE)),
				failure: call(receiveMsg(socket, serverMessages.COSMETICS_INVALID)),
			})

			if (result.success) {
				yield put<LocalMessage>({
					type: localMessages.COSMETICS_SET,
					appearance: result.success.appearance,
				})
				return
			}

			yield put<LocalMessage>({
				type: localMessages.TOAST_OPEN,
				open: true,
				title: 'Invalid',
				description: "Can't set this cosmetic as selected",
			})
		},
	)
}

export function* overviewSaga() {
	yield* takeEvery<LocalMessageTable[typeof localMessages.OVERVIEW]>(
		localMessages.OVERVIEW,
		function* (action) {
			const socket = yield* select(getSocket)

			yield* sendMsg({
				type: clientMessages.REPLAY_OVERVIEW,
				id: action.id,
			})

			const replay = yield* call(
				receiveMsg(socket, serverMessages.REPLAY_OVERVIEW_RECIEVED),
			)

			yield put<LocalMessage>({
				type: localMessages.DATABASE_SET,
				data: {
					key: 'replayOverview',
					value: replay.battleLog,
				},
			})
		},
	)
}
