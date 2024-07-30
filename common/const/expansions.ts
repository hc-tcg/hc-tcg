type ExpansionInfo = {
	name: string
}

type Expansions = {
	readonly default: ExpansionInfo
	readonly alter_egos: ExpansionInfo
	readonly alter_egos_ii: ExpansionInfo
	readonly season_x: ExpansionInfo
	readonly alter_egos_iii: ExpansionInfo
	readonly advent_of_tcg: ExpansionInfo
	readonly dream: ExpansionInfo
}

export const EXPANSIONS: Expansions = {
	default: {name: 'Base Set'},
	alter_egos: {name: 'Alter Egos'},
	alter_egos_ii: {name: 'Alter Egos Pt. II'},
	season_x: {name: 'HC Season X'},
	alter_egos_iii: {name: 'Alter Egos Pt. III'},
	advent_of_tcg: {name: 'Advent of TCG'},
	dream: {name: 'Dream'},
}

export type ExpansionT = keyof typeof EXPANSIONS

export const DISABLED_EXPANSIONS: Array<ExpansionT> = ['advent_of_tcg', 'dream']
