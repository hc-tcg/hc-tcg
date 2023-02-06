import {combineReducers} from 'redux'
import sessionReducer from 'logic/session/session-reducer'
import gameReducer from 'logic/game/game-reducer'
import socketReducer from 'logic/socket/socket-reducer'
import matchmakingReducer from 'logic/matchmaking/matchmaking-reducer'

const rootReducer = combineReducers({
	session: sessionReducer,
	game: gameReducer,
	socket: socketReducer,
	matchmaking: matchmakingReducer,
})

export default rootReducer
