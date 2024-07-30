import {TypeT} from '../../common/types/cards'

type strengths = {
	readonly any: Array<TypeT>
	readonly balanced: Array<TypeT>
	readonly builder: Array<TypeT>
	readonly explorer: Array<TypeT>
	readonly farm: Array<TypeT>
	readonly miner: Array<TypeT>
	readonly prankster: Array<TypeT>
	readonly pvp: Array<TypeT>
	readonly redstone: Array<TypeT>
	readonly speedrunner: Array<TypeT>
	readonly terraform: Array<TypeT>
}

export const STRENGTHS: strengths = {
	any: [],
	balanced: [],
	builder: ['terraform'],
	explorer: ['builder'],
	farm: ['explorer'],
	miner: ['prankster', 'redstone'],
	prankster: ['pvp', 'builder'],
	pvp: ['speedrunner', 'farm'],
	redstone: ['pvp'],
	speedrunner: ['miner', 'prankster'],
	terraform: ['redstone'],
}
