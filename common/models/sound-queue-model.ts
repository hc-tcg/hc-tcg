export default class SoundQueueModel {
	private soundQueue: Array<string> = []

	public read() {
		let tmp = this.soundQueue
		this.soundQueue = []
		return tmp
	}

	public queue(sound: string) {
		this.soundQueue.push(sound)
	}

	public addOneOf(...sounds: Array<string>) {
		this.soundQueue.push(sounds[Math.floor(Math.random() * sounds.length)])
	}
}
