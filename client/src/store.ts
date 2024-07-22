import {configureStore, Tuple} from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './root-saga'

import sessionReducer from 'logic/session/session-reducer'
import gameReducer from 'logic/game/game-reducer'
import socketReducer from 'logic/socket/socket-reducer'
import matchmakingReducer from 'logic/matchmaking/matchmaking-reducer'
import fbdbReducer from 'logic/fbdb/fbdb-reducer'
import localSettingsReducer from 'logic/local-settings/local-settings-reducer'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
	reducer: {
		session: sessionReducer,
		game: gameReducer,
		socketStatus: socketReducer,
		matchmaking: matchmakingReducer,
		fbdb: fbdbReducer,
		localSettings: localSettingsReducer,
	},
	middleware: () => new Tuple(sagaMiddleware),
})

sagaMiddleware.run(rootSaga)

export default store

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
