import {fork, call, race} from 'redux-saga/effects'
import {receiveMsg} from 'logic/socket/socket-saga'

function* fbdbSaga() {
	while (true) {
		const result = yield call(receiveMsg, 'gameoverstat')
		if (!!globalThis.dbObj.dbref) {
			let stats = globalThis.dbObj.stats
			if (result == 'you_won') {
				stats.w += 1
			}
			if (result == 'you_lost') {
				stats.l += 1
			}
			if (result == 'they_forfeit') {
				stats.fw += 1
			}
			if (result == 'you_forfeit') {
				stats.fl += 1
			}
			globalThis.dbObj.dbref.set(stats)
		}
	}
}

export default fbdbSaga
