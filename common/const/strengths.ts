import {HermitTypeT} from '../../common/types/cards'

const STRENGTHS: Record<HermitTypeT, Array<HermitTypeT>> = {
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

export default STRENGTHS
