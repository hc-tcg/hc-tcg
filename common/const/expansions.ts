export type ExpansionInfo = {
	name: string
	disabled: boolean
}

export type ExpansionT =
	| 'default'
	| 'alter_egos'
	| 'alter_egos_ii'
	| 'season_x'
	| 'alter_egos_iii'
	| 'advent_of_tcg'
	| 'advent_of_tcg_ii'
	| 'dream'
	| 'boss'

export type ExpansionDict = {
	readonly [Expansion in ExpansionT]: ExpansionInfo
}

export const EXPANSIONS: ExpansionDict = {
	default: {name: 'Base Set', disabled: false},
	alter_egos: {name: 'Alter Egos', disabled: false},
	alter_egos_ii: {name: 'Alter Egos Pt. II', disabled: false},
	season_x: {name: 'HC Season X', disabled: false},
	alter_egos_iii: {name: 'Alter Egos Pt. III', disabled: false},
	advent_of_tcg: {name: 'Advent of TCG', disabled: false},
	advent_of_tcg_ii: {name: 'Advent of TCG II', disabled: false},
	dream: {name: 'Dream', disabled: true},
	boss: {name: 'Boss', disabled: false},
}
