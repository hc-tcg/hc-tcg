import {TypeT} from '../../common/types/cards'

type StrengthsDict = {
	readonly [Type in TypeT]: Array<TypeT>
}

export const STRENGTHS: StrengthsDict = {
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
