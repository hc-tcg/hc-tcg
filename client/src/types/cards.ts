export type CardRarityT = 'common' | 'rare' | 'ultra_rare'

export type HermitTypeT =
	| 'balanced'
	| 'builder'
	| 'speedrunner'
	| 'redstone'
	| 'farm'
	| 'pvp'
	| 'terraform'
	| 'prankster'
	| 'miner'
	| 'explorer'
	| 'any'

export type ItemCardT = {
	type: 'item'
	rarity: CardRarityT
	hermitType: HermitTypeT
	id: string
}

export type EffectCardT = {
	type: 'effect' | 'single_use'
	rarity: CardRarityT
	description: string
	id: string
}

export type HermitAttackT = {
	name: string
	cost: Array<string>
	damage: number
	power: {
		type: string
		description: string
	} | null
}

export type HermitCardT = {
	type: 'hermit'
	id: string
	name: string
	rarity: CardRarityT
	hermitType: HermitTypeT
	health: number
	primary: HermitAttackT
	secondary: HermitAttackT
}

export type CardT = ItemCardT | EffectCardT | HermitCardT
