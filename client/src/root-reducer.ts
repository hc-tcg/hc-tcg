import databaseKeysReducer from 'logic/game/database/database-reducer'
import gameReducer from 'logic/game/game-reducer'
import localSettingsReducer from 'logic/local-settings/local-settings-reducer'
import matchmakingReducer from 'logic/matchmaking/matchmaking-reducer'
import sessionReducer from 'logic/session/session-reducer'
import socketReducer from 'logic/socket/socket-reducer'
import {combineReducers} from 'redux'

const rootReducer = combineReducers({
	session: sessionReducer,
	game: gameReducer,
	socketStatus: socketReducer,
	matchmaking: matchmakingReducer,
	localSettings: localSettingsReducer,
	databaseInfo: databaseKeysReducer,
})

export default rootReducer
