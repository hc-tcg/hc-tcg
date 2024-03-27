import {combineReducers} from 'redux'
import sessionReducer from 'logic/session/session-reducer'
import gameReducer from 'logic/game/game-reducer'
import fbdbReducer from 'logic/fbdb/fbdb-reducer'
import socketReducer from 'logic/socket/socket-reducer'
import matchmakingReducer from 'logic/matchmaking/matchmaking-reducer'
import localSettingsReducer from 'logic/local-settings/local-settings-reducer'
import permitsReducer from 'logic/permits/permits-reducer'

const rootReducer = combineReducers({
	session: sessionReducer,
	game: gameReducer,
	socketStatus: socketReducer,
	matchmaking: matchmakingReducer,
	fbdb: fbdbReducer,
	localSettings: localSettingsReducer,
	permits: permitsReducer,
})

export default rootReducer
