import {TypeT} from '../../common/types/cards'

type StrengthsDict = {
	readonly [Type in TypeT]: Array<TypeT>
}

export const STRENGTHS: StrengthsDict = {
	any: [],
	anarchist: ['builder', 'collector', 'pacifist'],
	athlete: ['bard', 'looper', 'miner'],
	balanced: [],
	bard: ['collector', 'farm', 'speedrunner'],
	builder: ['challenger', 'looper', 'terraform'],
	challenger: ['diplomat', 'inventor', 'looper'],
	collector: ['challenger', 'inventor', 'miner'],
	diplomat: ['explorer', 'pvp', 'speedrunner'],
	explorer: ['athlete', 'builder', 'historian'],
	farm: ['diplomat', 'explorer', 'historian'],
	historian: ['collector', 'terraform'],
	inventor: ['farm', 'pvp', 'terraform'],
	looper: ['anarchist', 'bard', 'explorer'],
	miner: ['anarchist', 'prankster', 'redstone'],
	pacifist: ['athlete', 'redstone'],
	prankster: ['builder', 'diplomat', 'historian'],
	pvp: ['farm', 'pacifist', 'speedrunner'],
	redstone: ['athlete', 'challenger', 'pvp'],
	scavenger: [],
	speedrunner: ['bard', 'miner', 'prankster'],
	terraform: ['anarchist', 'inventor', 'redstone'],
	everything: [], //These two are rigged in createWeakness() instead.
	mob: [], // Funtionality to be confirmed.
}
