import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {LocalMessageTable, localMessages} from 'logic/messages'
import {SagaIterator} from 'redux-saga'
import {call, takeEvery, takeLatest} from 'redux-saga/effects'
import {delay, fork, select} from 'typed-redux-saga'
import {trackList} from './sound-config'

const audioCtx = new AudioContext()
const bgMusic = new Audio()
const sourceNode = audioCtx.createMediaElementSource(bgMusic)
const musicGainNode = audioCtx.createGain()
const soundGainNode = audioCtx.createGain()
const voiceGainNode = audioCtx.createGain()
sourceNode.connect(musicGainNode).connect(audioCtx.destination)
soundGainNode.connect(audioCtx.destination)
voiceGainNode.connect(audioCtx.destination)

bgMusic.loop = true
musicGainNode.gain.value = 0.75

let interacted = false

// @ts-ignore
window.bgMusic = bgMusic
// @ts-ignore
window.audioCtx = audioCtx

function* backgroundMusic(
	action: LocalMessageTable[typeof localMessages.SOUND_SECTION_CHANGE],
): SagaIterator {
	if (action.section !== 'game') {
		bgMusic.pause()
		bgMusic.currentTime = 0
		bgMusic.src = ''
		if (interacted) {
			audioCtx.resume()
		}
		return
	}

	const musicFile =
		trackList.game[Math.floor(Math.random() * trackList.game.length)]

	const newPath = `/music/${musicFile.file}`
	if (newPath !== bgMusic.getAttribute('src')) {
		bgMusic.src = newPath
		if (interacted) {
			audioCtx.resume().then(() => bgMusic.play())
		}
	}
}

function* playSoundSaga(
	action: LocalMessageTable[typeof localMessages.SOUND_PLAY],
): SagaIterator {
	try {
		if (audioCtx.state !== 'running') return
		const settings = yield* select(getSettings)
		if (settings.soundVolume === 0) return

		const sound = new Audio(action.path)
		const sourceNode = audioCtx.createMediaElementSource(sound)
		sourceNode.connect(soundGainNode)
		sound.onended = () => sourceNode.disconnect(soundGainNode)
		sound.play()
	} catch (err) {
		console.log(err)
	}
}

const voiceAudio = new Audio()
const voiceSourceNode = audioCtx.createMediaElementSource(voiceAudio)

const voiceLineQueue: string[] = []
function* playVoiceSaga(
	action: LocalMessageTable[typeof localMessages.QUEUE_VOICE],
) {
	if (audioCtx.state !== 'running') return
	const settings = yield* select(getSettings)
	if (settings.voiceVolume === 0) return

	voiceLineQueue.push(...action.lines)
}

function* voiceQueuePlay() {
	while (true) {
		if (voiceLineQueue.length > 0 && voiceAudio.paused) {
			const nextAudio = voiceLineQueue.shift()
			if (nextAudio) {
				voiceSourceNode.connect(voiceGainNode)
				voiceAudio.onended = () => voiceSourceNode.disconnect(voiceGainNode)
				voiceAudio.pause()
				voiceAudio.src = nextAudio
				voiceAudio.currentTime = 0
				voiceAudio.play()
			}
		}
		yield* delay(100)
	}
}

function* playVoiceTest(
	_action: LocalMessageTable[typeof localMessages.PLAY_VOICE_TEST],
) {
	if (!voiceAudio.paused) return
	voiceAudio.src = '/voice/TEST.ogg'
	voiceAudio.onended = () => voiceSourceNode.disconnect(voiceGainNode)
	voiceSourceNode.connect(voiceGainNode)
	voiceAudio.play()
}

function* stopVoiceChannel(
	action: LocalMessageTable[typeof localMessages.SOUND_SECTION_CHANGE],
) {
	if (voiceAudio.paused || action.section === 'game') return
	voiceAudio.pause()
	voiceAudio.currentTime = 0
	voiceSourceNode.disconnect(voiceGainNode)
	while (voiceLineQueue.pop() !== undefined);
}

function* settingSaga(): SagaIterator {
	try {
		const settings = yield* select(getSettings)
		if (settings.soundMuted) {
			musicGainNode.gain.value = 0
			soundGainNode.gain.value = 0
			voiceGainNode.gain.value = 0
		} else {
			musicGainNode.gain.value = settings.musicVolume / 100
			soundGainNode.gain.value = settings.soundVolume / 100
			voiceGainNode.gain.value = settings.voiceVolume / 100
		}
		if (settings.musicMuted) {
			musicGainNode.gain.value = 0
		}
	} catch (err) {
		console.error(err)
	}
}

function* soundSaga(): SagaIterator {
	// @ts-ignore
	yield call(settingSaga)
	yield takeEvery(localMessages.SETTINGS_SET, settingSaga)
	yield takeLatest(localMessages.SOUND_SECTION_CHANGE, backgroundMusic)
	yield takeEvery(localMessages.SOUND_PLAY, playSoundSaga)
	yield takeEvery(localMessages.QUEUE_VOICE, playVoiceSaga)
	yield takeLatest(localMessages.PLAY_VOICE_TEST, playVoiceTest)
	yield takeLatest(localMessages.SOUND_SECTION_CHANGE, stopVoiceChannel)
	yield* fork(voiceQueuePlay)
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
		{once: true},
	)
}

export default soundSaga
