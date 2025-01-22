import {Achievement} from './types'

export const achievement: Omit<
	Achievement,
	'id' | 'numericId' | 'name' | 'description' | 'steps'
> = {
	getProgress(data: Buffer<ArrayBuffer>) {
		return data.readInt16BE(0)
	},
	onGameStart() {},
	onGameEnd() {},
}
