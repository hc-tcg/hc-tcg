export default class SoundQueueModel {
	public soundQueue: Array<string> = []

	public clear() {
		this.soundQueue = []
	}

	public queue(sound: string) {
		this.soundQueue.push(sound)
	}

	public addOneOf(...sounds: Array<string>) {
		this.soundQueue.push(sounds[Math.floor(Math.random() * sounds.length)])
	}
}
