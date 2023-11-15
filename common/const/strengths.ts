import {HermitTypeT} from '../../common/types/cards'

export const STRENGTHS: Record<HermitTypeT, Array<HermitTypeT>> = {
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
	coin: [],
}
