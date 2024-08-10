import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalMessage, localMessages} from 'logic/messages'
import {receiveMsg} from 'logic/socket/socket-saga'
import {SagaIterator, eventChannel} from 'redux-saga'
import {call, put, takeEvery, takeLatest} from 'typed-redux-saga'
import {FbdbState} from './fbdb-reducer'

const createAuthChannel = () => {
	return eventChannel((emitter: any) => {
		return firebase.auth().onAuthStateChanged(emitter)
	})
}

const createValueChannel = () => {
	return eventChannel((emitter: any) => {
		global.dbObj.dbref.on('value', emitter)
		return () => global.dbObj.dbref.off('value', emitter)
	})
}

function* authSaga(user: any): SagaIterator {
	if (!user) return
	yield* put<LocalMessage>({
		type: localMessages.FIREBASE_AUTHED,
		uuid: user.uid,
	})
	global.dbObj.uuid = user.uid
	global.dbObj.dbref = firebase.database().ref('/stats').child(user.uid)
	const valueChannel = yield* call(createValueChannel)
	yield* takeEvery(valueChannel, valueSaga)
}

function* valueSaga(ss: any) {
	const tmp: FbdbState['stats'] = ss.val() || {w: 0, l: 0, fw: 0, fl: 0, t: 0}
	if (!tmp.t) tmp.t = 0 // for old stats
	yield put<LocalMessage>({type: localMessages.FIREBASE_STATS, ...tmp})
	global.dbObj.stats = JSON.parse(JSON.stringify(tmp))
}

function* resetStatsSaga() {
	console.log('stats have been reset')
	global.dbObj.dbref.set({w: 0, l: 0, fw: 0, fl: 0, t: 0})
}

function* fbdbSaga(): SagaIterator {
	if (!firebase) return
	const authChannel = yield* call(createAuthChannel)
	yield* takeLatest(authChannel, authSaga)
	yield* takeEvery('RESET_STATS', resetStatsSaga)
	firebase.auth().signInAnonymously()

	while (true) {
		const {outcome, won} = yield* call(
			receiveMsg(serverMessages.GAME_OVER_STAT),
		)
		if (global.dbObj.dbref) {
			const stats = global.dbObj.stats
			if (outcome == 'player_won' && won) {
				stats.w += 1
			}
			if (outcome == 'player_won' && !won) {
				stats.l += 1
			}
			if (outcome == 'forfeit' && won) {
				stats.fw += 1
			}
			if (outcome == 'forfeit' && !won) {
				stats.fl += 1
			}
			if (outcome == 'tie') {
				// || 0 for records created before ties were a thing
				stats.t = (stats.t || 0) + 1
			}
			global.dbObj.dbref.set(stats)
		}
	}
}

export default fbdbSaga
