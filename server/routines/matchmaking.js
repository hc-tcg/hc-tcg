function* newMatchmakingSaga(action) {}

function* matchmakingSaga() {
	yield takeEvery('START_MATCHMAKING', newMatchmakingSaga)
}

export default matchmakingSaga
