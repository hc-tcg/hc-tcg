export type ExpansionInfo = {
	name: string
	disabled: boolean
}

export type ExpansionT =
	| 'default'
	| 'hermitcraftX'
	| 'hc_plus'
	| 'alter_egos'
	| 'season_x'
	| 'advent_of_tcg'
	| 'dream'
	| 'boss'
	| 'minecraft'

export type ExpansionDict = {
	readonly [Expansion in ExpansionT]: ExpansionInfo
}

export const EXPANSIONS: ExpansionDict = {
	default: {name: 'Hermitcraft', disabled: false},
	hermitcraftX: {name: 'HermitcraftX', disabled: false},
	hc_plus: {name: 'HC+', disabled: false},
	alter_egos: {name: 'Alter Egos', disabled: false},
	season_x: {name: 'HC Season X', disabled: false},
	advent_of_tcg: {name: 'Advent', disabled: true},
	dream: {name: 'Dream', disabled: false},
	boss: {name: 'Boss', disabled: true},
	minecraft: {name: 'Minecraft', disabled: false},
}
