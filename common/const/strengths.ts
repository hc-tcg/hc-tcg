import {TypeT} from '../../common/types/cards'

type strengths = {
	readonly [Type in TypeT]: Array<TypeT>
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
