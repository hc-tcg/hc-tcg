import {SagaIterator} from 'redux-saga'
import {call, takeLatest, takeEvery} from 'redux-saga/effects'
import {select} from 'typed-redux-saga'
import soundConfig from './sound-config'
import {SectionChangeT} from './sound-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'

const bgMusic = new Audio()
bgMusic.loop = true
bgMusic.volume = 0.75

let interacted = false

// @ts-ignore
window.bgMusic = bgMusic

function* backgroundMusic(action: SectionChangeT): SagaIterator {
	const section = action.payload

	const musicFile = soundConfig.background[section] || null
	if (!musicFile) {
		bgMusic.pause()
		bgMusic.currentTime = 0
		bgMusic.src = ''
		return
	}

	const newPath = `/sfx/${musicFile}`
	if (newPath !== bgMusic.getAttribute('src')) {
		bgMusic.src = newPath
		if (interacted) bgMusic.play()
	}
}

function* settingSaga(): SagaIterator {
	try {
		const settings = yield* select(getSettings)
		if (settings.musicVolume === '0') {
			bgMusic.volume = 0
		} else {
			bgMusic.volume = Number(settings.musicVolume) / 100
		}
	} catch (err) {
		console.error(err)
	}
}

function* soundSaga(): SagaIterator {
	// @ts-ignore
	yield call(settingSaga)
	yield takeEvery('SET_SETTING', settingSaga)
	yield takeLatest('@sound/SECTION_CHANGE', backgroundMusic)
	document.addEventListener(
		'click',
		() => {
			if (bgMusic.getAttribute('src')) bgMusic.play()
			interacted = true
		},
		{once: true}
	)
}

export default soundSaga
