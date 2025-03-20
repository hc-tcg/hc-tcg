export type ExpansionInfo = {
	name: string
	disabled: boolean
}

export type ExpansionT =
	| 'item'
	| 'default'
	| 'hermitcraftX'
	| 'hc_plus'
	| 'alter_egos'
	| 'season_x'
	| 'boss'
	| 'minecraft'
	| 'shifttech'
	| 'btc'
	| 'discord'
	| 'mcyt'
	| 'baseball'
	| 'ninjago'
	| 'television'
	| 'fortnite'
	| 'survivor'
	| 'holidays'
	| 'new_vegas'
	| 'youtube'
	| 'marvel'
	| 'decked_out'
	| 'artifake'
	| 'create'
	| 'his_fig'
	| 'modesto'
	| 'vg_legends'
	| 'touhou'
	| 'villager_news'
	| 'gravity_falls'
	| 'terraria'

export type ExpansionDict = {
	readonly [Expansion in ExpansionT]: ExpansionInfo
}

export const EXPANSIONS: ExpansionDict = {
	item: {name: 'Item', disabled: false},
	default: {name: 'Hermitcraft', disabled: false},
	hermitcraftX: {name: 'HermitcraftX', disabled: false},
	hc_plus: {name: 'HC+', disabled: false},
	alter_egos: {name: 'Alter Egos', disabled: false},
	season_x: {name: 'HC Season X', disabled: false},
	boss: {name: 'Boss', disabled: true},
	minecraft: {name: 'Minecraft', disabled: false},
	shifttech: {name: 'Shifttech', disabled: false},
	btc: {name: 'Beyond the Cosmos', disabled: false},
	discord: {name: 'HC TCG Discord', disabled: false},
	mcyt: {name: 'MCYT', disabled: false},
	baseball: {name: 'Baseball', disabled: false},
	ninjago: {name: 'Ninjago', disabled: false},
	television: {name: 'Television', disabled: false},
	fortnite: {name: 'Fortnite', disabled: false},
	survivor: {name: 'Survivor', disabled: false},
	holidays: {name: 'Holidays', disabled: false},
	new_vegas: {name: 'New Vegas', disabled: false},
	youtube: {name: 'Youtube', disabled: false},
	marvel: {name: 'Marvel', disabled: false},
	decked_out: {name: 'Decked Out', disabled: false},
	artifake: {name: 'Artifake', disabled: false},
	create: {name: 'Create', disabled: false},
	his_fig: {name: 'Historical Figures', disabled: false},
	modesto: {name: 'Modesto', disabled: false},
	vg_legends: {name: 'Video Game Legends', disabled: false},
	touhou: {name: 'Touhou Project', disabled: false},
	villager_news: {name: 'Villager News', disabled: false},
	gravity_falls: {name: 'Gravity Falls', disabled: false},
	terraria: {name: 'Terraria', disabled: false},
}
