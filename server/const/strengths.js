/**
 * @typedef {import('common/types/cards').HermitTypeT} HermitTypeT
 */

/** @type {Record<HermitTypeT, Array<HermitTypeT>>} */
const Strengths = {
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

export default Strengths
