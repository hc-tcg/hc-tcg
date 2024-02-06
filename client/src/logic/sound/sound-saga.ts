import {SagaIterator} from 'redux-saga'
import {call, takeLatest, takeEvery} from 'redux-saga/effects'
import {select} from 'typed-redux-saga'
import {trackList} from './sound-config'
import {SectionChangeT, PlaySoundT} from './sound-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {ToastT} from 'common/types/app'
import {useDispatch} from 'react-redux'
import {sendMsg} from 'logic/socket/socket-saga'

const audioCtx = new AudioContext()
const bgMusic = new Audio()
const sourceNode = audioCtx.createMediaElementSource(bgMusic)
const musicGainNode = audioCtx.createGain()
const soundGainNode = audioCtx.createGain()
sourceNode.connect(musicGainNode).connect(audioCtx.destination)
soundGainNode.connect(audioCtx.destination)

bgMusic.loop = true
musicGainNode.gain.value = 0.75

let interacted = false

// @ts-ignore
window.bgMusic = bgMusic
// @ts-ignore
window.audioCtx = audioCtx

function* backgroundMusic(action: SectionChangeT): SagaIterator {
	const section = action.payload

	if (section !== 'game') {
		bgMusic.pause()
		bgMusic.currentTime = 0
		bgMusic.src = ''
		if (interacted) {
			audioCtx.resume()
		}
		return
	}

	const musicFile = trackList.game[Math.floor(Math.random() * trackList.game.length)]

	const newPath = `/music/${musicFile.file}`
	if (newPath !== bgMusic.getAttribute('src')) {
		bgMusic.src = newPath
		if (interacted) {
			audioCtx.resume().then(() => bgMusic.play())
		}
	}
}

function* playSoundSaga(action: PlaySoundT): SagaIterator {
	try {
		if (audioCtx.state !== 'running') return
		const settings = yield* select(getSettings)
		if (settings.soundVolume === '0') return

		const sound = new Audio(action.payload)
		const sourceNode = audioCtx.createMediaElementSource(sound)
		sourceNode.connect(soundGainNode)
		sound.onended = () => sourceNode.disconnect(soundGainNode)
		sound.play()
	} catch (err) {
		console.log(err)
	}
}

function* settingSaga(): SagaIterator {
	try {
		const settings = yield* select(getSettings)
		musicGainNode.gain.value = Number(settings.musicVolume) / 100
		soundGainNode.gain.value = Number(settings.soundVolume) / 100
	} catch (err) {
		console.error(err)
	}
}

function* soundSaga(): SagaIterator {
	// @ts-ignore
	yield call(settingSaga)
	yield takeEvery('SET_SETTING', settingSaga)
	yield takeLatest('@sound/SECTION_CHANGE', backgroundMusic)
	yield takeEvery('@sound/PLAY_SOUND', playSoundSaga)
	document.addEventListener(
		'click',
		() => {
			if (bgMusic.getAttribute('src')) {
				audioCtx.resume().then(() => bgMusic.play())
			} else {
				audioCtx.resume()
			}
			interacted = true
		},
		{once: true}
	)
}

export default soundSaga
